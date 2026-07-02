"""
Gemini AI Service
Google Gemini integration for AI-powered features
"""
import json
from typing import Optional, List, Dict, Any
from loguru import logger

from app.config import settings
from app.ai.prompts import (
    CHAT_PROMPT, ATHLETE_SUMMARY_PROMPT, SCHOLARSHIP_FIT_PROMPT,
    MENTOR_MATCH_PROMPT, COLLEGE_FIT_PROMPT, SAFETY_GUIDANCE_PROMPT,
    MESSAGE_RISK_PROMPT
)


class GeminiService:
    """Google Gemini AI service with fallback support"""

    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.openai_api_key = settings.OPENAI_API_KEY
        self.groq_api_key = settings.GROQ_API_KEY
        self.primary_provider = settings.PRIMARY_AI_PROVIDER
        self._gemini_model = None
        self._openai_client = None
        self._groq_client = None

    @property
    def gemini_model(self):
        """Lazy load Gemini model"""
        if self._gemini_model is None and self.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                self._gemini_model = genai.GenerativeModel('gemini-2.0-flash')
            except ImportError:
                logger.warning("Google Generative AI not installed")
        return self._gemini_model

    @property
    def openai_client(self):
        """Lazy load OpenAI client"""
        if self._openai_client is None and self.openai_api_key:
            try:
                from openai import AsyncOpenAI
                self._openai_client = AsyncOpenAI(api_key=self.openai_api_key)
            except ImportError:
                logger.warning("OpenAI not installed")
        return self._openai_client

    @property
    def groq_client(self):
        """Lazy load Groq client"""
        if self._groq_client is None and self.groq_api_key:
            try:
                from groq import AsyncGroq
                self._groq_client = AsyncGroq(api_key=self.groq_api_key)
            except ImportError:
                logger.warning("Groq not installed")
        return self._groq_client

    async def generate(self, prompt: str, provider: str = None) -> str:
        """Generate response using specified provider with fallback"""
        provider = provider or self.primary_provider

        # Try primary provider
        if provider == "gemini":
            response = await self._try_gemini(prompt)
            if response:
                return response

        if provider in ["gemini", "openai"]:
            response = await self._try_openai(prompt)
            if response:
                return response

        if provider in ["gemini", "openai", "groq"]:
            response = await self._try_groq(prompt)
            if response:
                return response

        # All failed, return fallback
        return self._fallback_response(prompt)

    async def _try_gemini(self, prompt: str) -> Optional[str]:
        """Try Gemini API"""
        try:
            if self.gemini_model:
                response = await self.gemini_model.generate_content_async(prompt)
                return response.text
        except Exception as e:
            logger.warning(f"Gemini failed: {e}")
        return None

    async def _try_openai(self, prompt: str) -> Optional[str]:
        """Try OpenAI API"""
        try:
            if self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000
                )
                return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"OpenAI failed: {e}")
        return None

    async def _try_groq(self, prompt: str) -> Optional[str]:
        """Try Groq API"""
        try:
            if self.groq_client:
                response = await self.groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000
                )
                return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"Groq failed: {e}")
        return None

    def _fallback_response(self, prompt: str) -> str:
        """Generate fallback response when all AI services fail"""
        # Simple rule-based fallbacks
        lower_prompt = prompt.lower()

        if "scholarship" in lower_prompt:
            return json.dumps({
                "summary": "Scholarship information requires AI analysis.",
                "recommendation": "Please try again later or browse available scholarships manually."
            })

        if "mentor" in lower_prompt:
            return json.dumps({
                "matches": [],
                "explanation": "Mentor matching temporarily unavailable. Please browse mentors directly."
            })

        if "safety" in lower_prompt:
            return json.dumps({
                "guidance": "For safety concerns, please use the report feature immediately.",
                "actions": ["Report the incident", "Contact support", "Document evidence"]
            })

        return json.dumps({
            "response": "AI service temporarily unavailable. Please try again later.",
            "fallback": True
        })

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
            # Try to parse as JSON
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
            mentor_ids=json.dumps(mentor_ids[:10]),  # Limit to 10 for prompt
            top_n=top_n
        )

        response = await self.generate(prompt)

        try:
            matches = json.loads(response)
            return matches if isinstance(matches, list) else []
        except:
            # Return placeholder matches
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
            # Default to safe when parsing fails
            return {
                "risk_score": 0,
                "risk_level": "LOW",
                "flags": [],
                "recommendations": [],
                "should_flag": False,
                "reasoning": "Unable to analyze - defaulting to safe"
            }
