"""
Athlete Routes
Athlete profile management and dashboard
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user, require_athlete
from app.models.user import User, UserRole
from app.models.athlete import AthleteProfile, AchievementLevel
from app.models.mentorship_request import MentorshipRequest, RequestStatus
from app.models.scholarship import SavedScholarship
from app.schemas.athlete import (
    AthleteProfileCreate, AthleteProfileUpdate, AthleteProfileResponse, AthleteDashboard
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta


router = APIRouter()


@router.get("/profile", response_model=APIResponse[AthleteProfileResponse])
async def get_athlete_profile(
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get current athlete's profile"""
    if not current_user.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete profile not found. Please create one."
        )

    profile_data = AthleteProfileResponse.model_validate(current_user.athlete_profile)
    profile_data_dict = profile_data.model_dump()
    profile_data_dict["user"] = {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value
    }

    return APIResponse(
        success=True,
        message="Profile retrieved",
        data=profile_data_dict
    )


@router.post("/profile", response_model=APIResponse[AthleteProfileResponse], status_code=status.HTTP_201_CREATED)
async def create_athlete_profile(
    profile_data: AthleteProfileCreate,
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Create athlete profile"""
    # Check if profile already exists
    if current_user.athlete_profile:
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
    if not current_user.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create one first."
        )

    profile = current_user.athlete_profile
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(profile, field, value)

    profile.profile_completion = profile.calculate_completion()

    await db.commit()
    await db.refresh(profile)

    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data=AthleteProfileResponse.model_validate(profile)
    )


@router.get("/dashboard", response_model=APIResponse[AthleteDashboard])
async def get_athlete_dashboard(
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get athlete dashboard with stats and recommendations"""
    if not current_user.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    profile = current_user.athlete_profile

    # Count saved scholarships
    saved_count = await db.execute(
        select(func.count(SavedScholarship.id)).where(
            SavedScholarship.user_id == current_user.id
        )
    )
    saved_scholarships_count = saved_count.scalar() or 0

    # Count pending mentorship requests
    pending_requests = await db.execute(
        select(func.count(MentorshipRequest.id)).where(
            MentorshipRequest.athlete_id == current_user.id,
            MentorshipRequest.status == RequestStatus.PENDING
        )
    )
    pending_requests_count = pending_requests.scalar() or 0

    # Count active mentorships
    active_mentorships = await db.execute(
        select(func.count(MentorshipRequest.id)).where(
            MentorshipRequest.athlete_id == current_user.id,
            MentorshipRequest.status == RequestStatus.APPROVED
        )
    )
    active_mentorships_count = active_mentorships.scalar() or 0

    dashboard = AthleteDashboard(
        profile_completion=profile.profile_completion,
        saved_scholarships_count=saved_scholarships_count,
        pending_mentorship_requests=pending_requests_count,
        active_mentorships=active_mentorships_count,
        available_opportunities=0,  # TODO: Calculate
        upcoming_deadlines=[],  # TODO: Fetch
        recent_notifications_count=0,  # TODO: Calculate
        recommended_mentors=[],  # TODO: AI recommendation
        matched_scholarships=[],  # TODO: AI matching
        matched_colleges=[]  # TODO: AI matching
    )

    return APIResponse(
        success=True,
        message="Dashboard data retrieved",
        data=dashboard
    )


@router.put("/profile/completion", response_model=APIResponse[dict])
async def update_profile_completion(
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Recalculate and return profile completion"""
    if not current_user.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    profile = current_user.athlete_profile
    profile.profile_completion = profile.calculate_completion()

    await db.commit()

    return APIResponse(
        success=True,
        message="Profile completion updated",
        data={"profile_completion": profile.profile_completion}
    )


@router.get("/mentors/recommended", response_model=APIResponse[List[dict]])
async def get_recommended_mentors(
    limit: int = Query(default=5, ge=1, le=20),
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-recommended mentors for current athlete"""
    # TODO: Implement AI-based mentor matching
    # For now, return verified mentors

    result = await db.execute(
        select(User)
        .join(User.mentor_profile)
        .where(
            User.role == UserRole.MENTOR,
            User.is_active == True
        )
        .options(selectinload(User.mentor_profile))
        .limit(limit)
    )
    mentors = result.scalars().all()

    mentor_list = [
        {
            "id": str(m.id),
            "name": m.full_name,
            "expertise": m.mentor_profile.expertise if m.mentor_profile else None,
            "verified": m.mentor_profile.verified if m.mentor_profile else False,
            "rating": m.mentor_profile.average_rating if m.mentor_profile else 0,
        }
        for m in mentors
    ]

    return APIResponse(
        success=True,
        message="Recommended mentors retrieved",
        data=mentor_list
    )


@router.get("/scholarships/matches", response_model=APIResponse[List[dict]])
async def get_matched_scholarships(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-matched scholarships for current athlete"""
    # TODO: Implement AI-based scholarship matching
    from app.models.scholarship import Scholarship
    from datetime import date

    if not current_user.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    profile = current_user.athlete_profile

    # Simple matching: scholarships matching sport and state
    result = await db.execute(
        select(Scholarship)
        .where(
            Scholarship.deadline >= date.today(),
            (Scholarship.sport == None) | (Scholarship.sport == profile.sport),
            (Scholarship.state == None) | (Scholarship.state == profile.state)
        )
        .limit(limit)
    )
    scholarships = result.scalars().all()

    scholarship_list = [
        {
            "id": str(s.id),
            "name": s.name,
            "provider": s.provider,
            "amount": s.amount,
            "deadline": str(s.deadline),
        }
        for s in scholarships
    ]

    return APIResponse(
        success=True,
        message="Matched scholarships retrieved",
        data=scholarship_list
    )
