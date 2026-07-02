"""
AI Routes
AI-powered features: chat, matching, summaries
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.athlete import AthleteProfile  # ← Import from models
# DO NOT define AthleteProfile class here!
from app.schemas.ai import (
    AIChatRequest, AIChatResponse,
    AthleteSummaryRequest, AthleteSummaryResponse,
    ScholarshipFitRequest, ScholarshipFitResponse,
    MentorMatchRequest, MentorMatchResponse,
    CollegeFitRequest, CollegeFitResponse,
    MessageRiskRequest, MessageRiskResponse
)
from app.schemas.common import APIResponse


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/chat", response_model=APIResponse[AIChatResponse])
@limiter.limit("10/minute")
async def ai_chat(
    request: Request,
    chat_request: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI chat assistant.
    Provides contextual answers about scholarships, mentorship, training, etc.
    """
    from app.ai.gemini import GeminiService

    try:
        ai_service = GeminiService()
        response = await ai_service.chat(
            question=chat_request.question,
            athlete_id=chat_request.athlete_id,
            context=chat_request.context,
            history=chat_request.conversation_history
        )

        return APIResponse(
            success=True,
            message="AI response generated",
            data=response
        )

    except Exception as e:
        return APIResponse(
            success=True,
            message="AI response (fallback)",
            data=AIChatResponse(
                answer="I'm currently experiencing high demand. Please try again later or contact support for immediate assistance.",
                source="fallback",
                confidence=0.5
            )
        )


@router.post("/athlete-summary", response_model=APIResponse[AthleteSummaryResponse])
@limiter.limit("10/minute")
async def athlete_summary(
    request: Request,
    summary_request: AthleteSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate AI summary of athlete profile.
    Analyzes strengths, areas for improvement, and recommendations.
    """
    from app.ai.gemini import GeminiService

    # Get athlete data
    result = await db.execute(
        select(User).where(User.id == summary_request.athlete_id)
    )
    athlete = result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    try:
        ai_service = GeminiService()
        summary = await ai_service.athlete_summary(athlete.athlete_profile)

        return APIResponse(
            success=True,
            message="Summary generated",
            data=AthleteSummaryResponse(
                athlete_id=summary_request.athlete_id,
                **summary,
                generated_at="now"
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/scholarship-fit", response_model=APIResponse[ScholarshipFitResponse])
@limiter.limit("10/minute")
async def scholarship_fit(
    request: Request,
    fit_request: ScholarshipFitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate AI-powered scholarship fit score.
    Returns match score, reasoning, and suggested actions.
    """
    from app.ai.gemini import GeminiService
    from app.models.scholarship import Scholarship

    # Get athlete and scholarship
    athlete_result = await db.execute(
        select(User).where(User.id == fit_request.athlete_id)
    )
    athlete = athlete_result.scalar_one_or_none()

    scholarship_result = await db.execute(
        select(Scholarship).where(Scholarship.id == fit_request.scholarship_id)
    )
    scholarship = scholarship_result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship not found"
        )

    try:
        ai_service = GeminiService()
        fit_result = await ai_service.scholarship_fit(
            athlete.athlete_profile,
            scholarship
        )

        return APIResponse(
            success=True,
            message="Fit analysis complete",
            data=ScholarshipFitResponse(
                athlete_id=fit_request.athlete_id,
                scholarship_id=fit_request.scholarship_id,
                **fit_result
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/mentor-match", response_model=APIResponse[MentorMatchResponse])
@limiter.limit("10/minute")
async def mentor_match(
    request: Request,
    match_request: MentorMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    AI-powered mentor matching.
    Ranks mentors based on athlete needs and mentor expertise.
    """
    from app.ai.gemini import GeminiService

    # Get athlete
    athlete_result = await db.execute(
        select(User).where(User.id == match_request.athlete_id)
    )
    athlete = athlete_result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    try:
        ai_service = GeminiService()
        matches = await ai_service.mentor_match(
            athlete.athlete_profile,
            match_request.mentor_ids,
            match_request.top_n
        )

        return APIResponse(
            success=True,
            message="Mentor matches generated",
            data=MentorMatchResponse(
                athlete_id=match_request.athlete_id,
                matches=matches,
                total_mentors_evaluated=len(match_request.mentor_ids),
                source="gemini"
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/college-fit", response_model=APIResponse[CollegeFitResponse])
@limiter.limit("10/minute")
async def college_fit(
    request: Request,
    fit_request: CollegeFitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate AI-powered college fit score.
    Analyzes sports quota, academic streams, and location.
    """
    from app.ai.gemini import GeminiService
    from app.models.college import College

    # Get athlete and college
    athlete_result = await db.execute(
        select(User).where(User.id == fit_request.athlete_id)
    )
    athlete = athlete_result.scalar_one_or_none()

    college_result = await db.execute(
        select(College).where(College.id == fit_request.college_id)
    )
    college = college_result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found"
        )

    try:
        ai_service = GeminiService()
        fit_result = await ai_service.college_fit(
            athlete.athlete_profile,
            college
        )

        return APIResponse(
            success=True,
            message="College fit analysis complete",
            data=CollegeFitResponse(
                athlete_id=fit_request.athlete_id,
                college_id=fit_request.college_id,
                **fit_result
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/message-risk", response_model=APIResponse[MessageRiskResponse])
@limiter.limit("30/minute")
async def message_risk(
    request: Request,
    risk_request: MessageRiskRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Assess message content for safety risks.
    Detects inappropriate content, harassment, grooming patterns.
    """
    from app.ai.gemini import GeminiService

    try:
        ai_service = GeminiService()
        risk_result = await ai_service.message_risk(
            risk_request.message_content,
            risk_request.sender_id,
            risk_request.receiver_id,
            risk_request.context
        )

        return APIResponse(
            success=True,
            message="Risk assessment complete",
            data=MessageRiskResponse(**risk_result)
        )

    except Exception as e:
        # Default to safe when AI fails
        return APIResponse(
            success=True,
            message="Risk assessment (default)",
            data=MessageRiskResponse(
                risk_score=0,
                risk_level="LOW",
                flags=[],
                recommendations=["AI moderation temporarily unavailable"],
                should_flag=False,
                reasoning="Default safe response due to service error"
            )
        )


@router.post("/safety-guidance", response_model=APIResponse[dict])
@limiter.limit("10/minute")
async def safety_guidance(
    request: Request,
    report_id: str = None,
    safety_concern: str = None,
    category: str = None,
    current_user: User = Depends(get_current_user)
):
    """
    Provide AI-generated safety guidance.
    Offers resources and steps for safety concerns.
    """
    from app.ai.gemini import GeminiService

    try:
        ai_service = GeminiService()
        guidance = await ai_service.safety_guidance(
            report_id=report_id,
            safety_concern=safety_concern,
            category=category
        )

        return APIResponse(
            success=True,
            message="Safety guidance generated",
            data=guidance
        )

    except Exception as e:
        return APIResponse(
            success=True,
            message="Safety guidance (fallback)",
            data={
                "guidance": "If you're experiencing a safety concern, please report it immediately using the safety report feature. For emergencies, contact local authorities.",
                "immediate_actions": [
                    "Report the incident using the app",
                    "Document any evidence",
                    "Contact a trusted adult"
                ],
                "resources": [
                    "Internal reporting system",
                    "Safety team support"
                ]
            }
        )