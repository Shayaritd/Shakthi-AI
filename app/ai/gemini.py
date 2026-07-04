import json
from typing import Optional, List, Dict, Any
from loguru import logger
import google.generativeai as genai

from app.config import settings
from app.ai.base import AIProvider
from app.ai.prompts import (
    CHAT_PROMPT, ATHLETE_SUMMARY_PROMPT, SCHOLARSHIP_FIT_PROMPT,
    MENTOR_MATCH_PROMPT, COLLEGE_FIT_PROMPT, SAFETY_GUIDANCE_PROMPT,
    MESSAGE_RISK_PROMPT
)

class GeminiProvider(AIProvider):
    """Google Gemini AI implementation of the AIProvider base interface"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or 'gemini-1.5-flash'
        self._model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self._model = genai.GenerativeModel(self.model_name)
            except Exception as e:
                logger.error(f"Error configuring Google Generative AI: {e}")

    async def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        if not self._model:
            raise RuntimeError("GeminiProvider: genai model is not configured (missing API Key)")
        
        # System instructions parameter name depends on the SDK version.
        # For older SDK version (0.3.x/0.4.x), system instructions are passed in configuration or on model creation.
        # To be safe and compatible with google-generativeai==0.3.2, we format system_instruction into the prompt
        # if the system_instruction argument is not natively supported in GenerativeModel init.
        
        full_prompt = prompt
        if system_instruction:
            full_prompt = f"System Instruction: {system_instruction}\n\nUser Question/Prompt: {prompt}"

        # Run synchronously via standard call or async loop if supported
        # Note: older SDKs do not have generate_content_async, so we call generate_content
        # in an executor or call it directly. Direct synchronous call is fine inside FastAPI's async def
        # but to keep it non-blocking, we run it or call it. We will use generate_content.
        try:
            response = self._model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation call failed: {e}")
            raise e

    async def get_embeddings(self, text: str) -> List[float]:
        if not self.api_key:
            raise RuntimeError("GeminiProvider: api key is missing")
        try:
            # text-embedding-004 is standard for Gemini embeddings
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Gemini embedding call failed: {e}")
            raise e


class GeminiService:
    """
    Facade/Service wrapper preserving existing codebase interface compatibility.
    Updated to use AIProviderRouter under the hood for failover robustness.
    """

    def __init__(self):
        from app.ai.router import AIProviderRouter
        from app.ai.mock import MockProvider
        
        primary = GeminiProvider(api_key=settings.GEMINI_API_KEY)
        fallback = MockProvider()
        self.router = AIProviderRouter(primary=primary, fallback=fallback)
        self.primary_provider = "gemini"

    async def generate(self, prompt: str, system_instruction: str = None) -> str:
        return await self.router.generate(prompt, system_instruction)

    async def chat(
        self,
        question: str,
        athlete_id: str = None,
        context: Dict[str, Any] = None,
        history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Chat with AI assistant"""
        prompt = CHAT_PROMPT.format(
            question=question,
            athlete_id=athlete_id or "Unknown",
            context=json.dumps(context) if context else "None",
            history=json.dumps(history) if history else "None"
        )

        response = await self.generate(prompt)

        return {
            "answer": response,
            "source": self.primary_provider,
            "confidence": 0.85
        }

    async def athlete_summary(self, athlete_data: Any) -> Dict[str, Any]:
        """Generate athlete profile summary"""
        prompt = ATHLETE_SUMMARY_PROMPT.format(
            athlete_data=json.dumps({
                "sport": athlete_data.sport,
                "level": athlete_data.level.value if hasattr(athlete_data.level, 'value') else str(athlete_data.level),
                "district": athlete_data.district,
                "state": athlete_data.state,
                "achievements": athlete_data.achievements,
                "goals": athlete_data.goals,
                "bio": athlete_data.bio
            })
        )

        response = await self.generate(prompt)

        try:
            return json.loads(response)
        except:
            return {
                "summary": response[:200] if len(response) > 200 else response,
                "strengths": ["Athletic dedication", "Goal-oriented"],
                "areas_for_improvement": ["Profile completion", "Additional achievements"],
                "recommended_next_steps": ["Complete profile", "Add achievements", "Find a mentor"],
                "profile_strength_score": 70.0
            }

    async def scholarship_fit(
        self,
        athlete_data: Any,
        scholarship_data: Any
    ) -> Dict[str, Any]:
        """Calculate scholarship fit score"""
        prompt = SCHOLARSHIP_FIT_PROMPT.format(
            athlete=json.dumps({
                "sport": athlete_data.sport,
                "level": str(athlete_data.level),
                "state": athlete_data.state
            }),
            scholarship=json.dumps({
                "name": scholarship_data.name,
                "sport": scholarship_data.sport,
                "state": scholarship_data.state,
                "eligibility": scholarship_data.eligibility,
                "girls_only": scholarship_data.girls_only
            })
        )

        response = await self.generate(prompt)

        try:
            return json.loads(response)
        except:
            return {
                "match_score": 65.0,
                "reasoning": "Basic match based on profile data",
                "suggested_actions": ["Review eligibility criteria", "Prepare documents"],
                "eligibility_gaps": [],
                "strengths_alignment": ["Sport match", "Level appropriate"]
            }

    async def mentor_match(
        self,
        athlete_data: Any,
        mentor_ids: List[str],
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """Find best mentor matches"""
        prompt = MENTOR_MATCH_PROMPT.format(
            athlete=json.dumps({
                "sport": athlete_data.sport,
                "level": str(athlete_data.level),
                "goals": athlete_data.goals
            }),
            mentor_ids=json.dumps(mentor_ids[:10]),
            top_n=top_n
        )

        response = await self.generate(prompt)

        try:
            matches = json.loads(response)
            return matches if isinstance(matches, list) else []
        except:
            return [{"mentor_id": mid, "score": 70, "explanation": "Match pending"} for mid in mentor_ids[:top_n]]

    async def college_fit(
        self,
        athlete_data: Any,
        college_data: Any
    ) -> Dict[str, Any]:
        """Calculate college fit score"""
        prompt = COLLEGE_FIT_PROMPT.format(
            athlete=json.dumps({
                "sport": athlete_data.sport,
                "level": str(athlete_data.level),
                "state": athlete_data.state
            }),
            college=json.dumps({
                "name": college_data.name,
                "sports_quota": college_data.sports_quota,
                "supported_sports": college_data.supported_sports,
                "fee_concession": college_data.fee_concession
            })
        )

        response = await self.generate(prompt)

        try:
            return json.loads(response)
        except:
            return {
                "fit_score": 65.0,
                "reasoning": "College has sports quota",
                "suggested_actions": ["Review admission requirements", "Check deadlines"],
                "sports_quota_alignment": "Available",
                "academic_streams_match": []
            }

    async def safety_guidance(
        self,
        report_id: str = None,
        safety_concern: str = None,
        category: str = None
    ) -> Dict[str, Any]:
        """Provide safety guidance"""
        prompt = SAFETY_GUIDANCE_PROMPT.format(
            report_id=report_id or "N/A",
            safety_concern=safety_concern or "General safety",
            category=category or "General"
        )

        response = await self.generate(prompt)

        try:
            return json.loads(response)
        except:
            return {
                "guidance": response[:300] if len(response) > 300 else response,
                "immediate_actions": ["Report the incident", "Save any evidence"],
                "resources": ["Safety team", "Support helpline"],
                "escalation_threshold": "For emergencies, contact local authorities immediately.",
                "disclaimer": "This AI-generated guidance is for informational purposes only."
            }

    async def message_risk(
        self,
        content: str,
        sender_id: str,
        receiver_id: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Assess message for safety risks"""
        prompt = MESSAGE_RISK_PROMPT.format(
            message=content,
            sender_id=sender_id,
            receiver_id=receiver_id,
            context=json.dumps(context) if context else "None"
        )

        response = await self.generate(prompt)

        try:
            result = json.loads(response)
            return {
                "risk_score": result.get("risk_score", 0),
                "risk_level": result.get("risk_level", "LOW"),
                "flags": result.get("flags", []),
                "recommendations": result.get("recommendations", []),
                "should_flag": result.get("should_flag", False),
                "moderation_action": result.get("moderation_action"),
                "reasoning": result.get("reasoning")
            }
        except:
            return {
                "risk_score": 0,
                "risk_level": "LOW",
                "flags": [],
                "recommendations": [],
                "should_flag": False,
                "reasoning": "Unable to analyze - defaulting to safe"
            }
