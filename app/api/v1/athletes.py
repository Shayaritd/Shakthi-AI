"""
Athlete Routes
Athlete profile management and dashboard
"""
from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user, require_athlete
from app.models.user import User
from app.models.athlete import AthleteProfile, AchievementLevel
from app.models.mentor import MentorProfile
from app.models.scholarship import Scholarship
from app.schemas.athlete import (
    AthleteProfileCreate, AthleteProfileUpdate, AthleteProfileResponse
)
from app.schemas.common import APIResponse


router = APIRouter(prefix="/athletes", tags=["Athletes"])


@router.get("/profile", response_model=APIResponse[AthleteProfileResponse])
async def get_athlete_profile(
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get current athlete's profile"""
    result = await db.execute(
        select(AthleteProfile)
        .where(AthleteProfile.user_id == current_user.id)
        .options(selectinload(AthleteProfile.user))
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete profile not found"
        )

    return APIResponse(
        success=True,
        message="Profile retrieved",
        data=AthleteProfileResponse.model_validate(profile)
    )


@router.post("/profile", response_model=APIResponse[AthleteProfileResponse], status_code=status.HTTP_201_CREATED)
async def create_athlete_profile(
    profile_data: AthleteProfileCreate,
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Create athlete profile"""
    # Check if profile already exists
    result = await db.execute(
        select(AthleteProfile).where(AthleteProfile.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update."
        )

    profile = AthleteProfile(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    profile.profile_completion = profile.calculate_completion()

    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    return APIResponse(
        success=True,
        message="Profile created successfully",
        data=AthleteProfileResponse.model_validate(profile)
    )


@router.put("/profile", response_model=APIResponse[AthleteProfileResponse])
async def update_athlete_profile(
    update_data: AthleteProfileUpdate,
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Update athlete profile"""
    result = await db.execute(
        select(AthleteProfile)
        .where(AthleteProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        # Create profile if it doesn't exist
        profile = AthleteProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(profile, field, value)

    # Update profile completion
    profile.profile_completion = profile.calculate_completion()

    await db.commit()
    await db.refresh(profile)

    return APIResponse(
        success=True,
        message="Profile updated",
        data=AthleteProfileResponse.model_validate(profile)
    )


@router.get("/dashboard", response_model=APIResponse[dict])
async def get_athlete_dashboard(
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get athlete dashboard with stats, mentors, and scholarships"""
    
    # Get athlete profile
    result = await db.execute(
        select(AthleteProfile)
        .where(AthleteProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    # Get recommended mentors (top 3 by trust_score)
    mentor_result = await db.execute(
        select(MentorProfile)
        .where(MentorProfile.verified == True)
        .order_by(MentorProfile.trust_score.desc())
        .limit(3)
    )
    mentors = mentor_result.scalars().all()

    # Get scholarship matches (top 3 by deadline)
    scholarship_result = await db.execute(
        select(Scholarship)
        .order_by(Scholarship.deadline.asc())
        .limit(3)
    )
    scholarships = scholarship_result.scalars().all()

    # Prepare mentor data
    mentor_list = []
    for mentor in mentors:
        user_result = await db.execute(
            select(User).where(User.id == mentor.user_id)
        )
        user = user_result.scalar_one_or_none()
        mentor_list.append({
            "id": str(mentor.id),
            "name": user.full_name if user else "Unknown",
            "sport": mentor.expertise,
            "match_score": round(mentor.trust_score * 100 if mentor.trust_score else 0, 0)
        })

    # Prepare scholarship data
    scholarship_list = []
    for scholarship in scholarships:
        scholarship_list.append({
            "id": str(scholarship.id),
            "name": scholarship.name,
            "amount": scholarship.amount,
            "match_score": 95
        })

    # Calculate stats
    stats = {
        "total_training_days": 24,
        "skill_points": 840,
        "badges": 6,
        "coach_reviews": 12
    }

    return APIResponse(
        success=True,
        message="Dashboard data retrieved",
        data={
            "profile": {
                "full_name": current_user.full_name,
                "sport": profile.sport if profile else None,
                "district": profile.district if profile else None,
                "state": profile.state if profile else None,
                "level": profile.level.value if profile and profile.level else None,
                "profile_completion": profile.profile_completion if profile else 0
            },
            "stats": stats,
            "recommended_mentors": mentor_list,
            "scholarship_matches": scholarship_list
        }
    )


@router.get("/mentors/recommended", response_model=APIResponse[List[dict]])
async def get_recommended_mentors(
    limit: int = Query(default=5, ge=1, le=20),
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get recommended mentors for athlete"""
    
    result = await db.execute(
        select(MentorProfile)
        .where(MentorProfile.verified == True)
        .order_by(MentorProfile.trust_score.desc())
        .limit(limit)
    )
    mentors = result.scalars().all()

    mentor_list = []
    for mentor in mentors:
        user_result = await db.execute(
            select(User).where(User.id == mentor.user_id)
        )
        user = user_result.scalar_one_or_none()
        mentor_list.append({
            "id": str(mentor.id),
            "name": user.full_name if user else "Unknown",
            "expertise": mentor.expertise,
            "experience_years": mentor.experience_years,
            "trust_score": mentor.trust_score,
            "verified": mentor.verified,
            "average_rating": mentor.average_rating,
            "total_reviews": mentor.total_reviews
        })

    return APIResponse(
        success=True,
        message="Recommended mentors retrieved",
        data=mentor_list
    )


@router.get("/scholarships/matches", response_model=APIResponse[List[dict]])
async def get_scholarship_matches(
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get scholarship matches for athlete"""
    
    # Get athlete profile to check sport and level
    result = await db.execute(
        select(AthleteProfile).where(AthleteProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    # Build query based on athlete profile
    query = select(Scholarship)
    if profile and profile.sport:
        query = query.where(Scholarship.sport == profile.sport)
    
    query = query.order_by(Scholarship.deadline.asc()).limit(5)
    
    scholarship_result = await db.execute(query)
    scholarships = scholarship_result.scalars().all()

    scholarship_list = []
    for scholarship in scholarships:
        scholarship_list.append({
            "id": str(scholarship.id),
            "name": scholarship.name,
            "provider": scholarship.provider,
            "amount": scholarship.amount,
            "deadline": scholarship.deadline.isoformat() if scholarship.deadline else None,
            "sport": scholarship.sport,
            "eligibility": scholarship.eligibility,
            "girls_only": scholarship.girls_only,
            "hostel_support": scholarship.hostel_support,
            "match_score": 85 if profile and profile.sport == scholarship.sport else 70
        })

    return APIResponse(
        success=True,
        message="Scholarship matches retrieved",
        data=scholarship_list
    )