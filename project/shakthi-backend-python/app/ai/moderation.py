"""
Moderation Module
Content moderation for chat messages
"""
from typing import Dict, Any, List, Optional
from loguru import logger

from app.ai.gemini import GeminiService


class ContentModerator:
    """Moderate chat content for safety"""

    # Keywords that trigger additional scrutiny
    FLAG_KEYWORDS = [
        "meet alone", "private place", "secret", "don't tell",
        "send photo", "address", "phone number", "personal",
        "transfer money", "bank", "payment", "fee"
    ]

    # Positive indicators
    SAFE_INDICATORS = [
        "training", "practice", "schedule", "goals", "progress",
        "scholarship", "college", "tournament", "competition"
    ]

    def __init__(self):
        self.ai_service = GeminiService()

    async def moderate_message(
        self,
        content: str,
        sender_id: str,
        receiver_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Moderate a message and return moderation result.

        Returns:
            Dict with keys: is_safe, flags, should_warn, action
        """
        # Quick keyword check first
        quick_flags = self._keyword_check(content)

        # AI-based analysis for more nuance
        ai_result = await self.ai_service.message_risk(
            content=content,
            sender_id=sender_id,
            receiver_id=receiver_id,
            context=context
        )

        # Combine results
        combined_flags = list(set(quick_flags + ai_result.get("flags", [])))

        # Determine action
        risk_score = ai_result.get("risk_score", 0)
        action = self._determine_action(risk_score, combined_flags)

        return {
            "is_safe": risk_score < 50 and len(combined_flags) == 0,
            "flags": combined_flags,
            "risk_score": risk_score,
            "risk_level": ai_result.get("risk_level", "LOW"),
            "should_warn": risk_score >= 30,
            "action": action,
            "reasoning": ai_result.get("reasoning")
        }

    def _keyword_check(self, content: str) -> List[str]:
        """Quick keyword-based flagging"""
        flags = []
        lower_content = content.lower()

        for keyword in self.FLAG_KEYWORDS:
            if keyword in lower_content:
                flags.append(f"keyword:{keyword}")

        return flags

    def _determine_action(self, risk_score: float, flags: List[str]) -> str:
        """Determine moderation action based on risk score and flags"""
        if risk_score >= 80:
            return "block"
        elif risk_score >= 60:
            return "flag_for_review"
        elif risk_score >= 40:
            return "warn_user"
        elif len(flags) > 0:
            return "log"
        else:
            return "allow"


async def moderate_chat_message(
    content: str,
    sender_id: str,
    receiver_id: str,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Main entry point for chat message moderation.

    Returns moderation result dict.
    """
    moderator = ContentModerator()
    return await moderator.moderate_message(
        content=content,
        sender_id=sender_id,
        receiver_id=receiver_id,
        context=context
    )
