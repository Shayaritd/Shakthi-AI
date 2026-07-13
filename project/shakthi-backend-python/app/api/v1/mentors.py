"""
Mentor Routes
Mentor profile, search, and mentorship request management
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user, require_mentor
from app.models.user import User, UserRole
from app.models.mentor import MentorProfile
from app.models.mentorship_request import MentorshipRequest, RequestStatus, MentorshipMode
from app.schemas.mentor import (
    MentorProfileCreate, MentorProfileUpdate, MentorProfileResponse,
    MentorshipRequestCreate, MentorshipRequestResponse, MentorshipRequestUpdate
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[MentorProfileResponse]])
async def list_mentors(
    sport: Optional[str] = Query(None),
    expertise: Optional[str] = Query(None),
    verified: Optional[bool] = Query(None),
    min_experience: Optional[int] = Query(None),
    min_rating: Optional[float] = Query(None),
    state: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List mentors with filters"""
    query = (
        select(User)
        .join(MentorProfile, User.id == MentorProfile.user_id)
        .where(User.role == UserRole.MENTOR, User.is_active == True)
        .options(selectinload(User.mentor_profile))
    )

    # Apply filters
    if verified is not None:
        query = query.where(MentorProfile.verified == verified)

    if min_experience is not None:
        query = query.where(MentorProfile.experience_years >= min_experience)

    if min_rating is not None:
        query = query.where(MentorProfile.average_rating >= min_rating)

    if expertise:
        query = query.where(MentorProfile.expertise.ilike(f"%{expertise}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(MentorProfile.average_rating.desc())

    result = await db.execute(query)
    mentors = result.scalars().all()

    return APIResponse(
        success=True,
        message="Mentors retrieved",
        data=[MentorProfileResponse.model_validate(m) for m in mentors],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/{mentor_id}", response_model=APIResponse[MentorProfileResponse])
async def get_mentor(
    mentor_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get mentor details by ID"""
    result = await db.execute(
        select(User)
        .where(User.id == mentor_id, User.role == UserRole.MENTOR)
        .options(selectinload(User.mentor_profile))
    )
    mentor = result.scalar_one_or_none()

    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )

    response_data = MentorProfileResponse.model_validate(mentor)
    response_dict = response_data.model_dump()
    response_dict["user"] = {
        "id": str(mentor.id),
        "full_name": mentor.full_name,
        "email": mentor.email,
    }

    return APIResponse(
        success=True,
        message="Mentor retrieved",
        data=response_dict
    )


@router.post("/request", response_model=APIResponse[MentorshipRequestResponse], status_code=status.HTTP_201_CREATED)
async def request_mentorship(
    request_data: MentorshipRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request mentorship from a mentor"""
    if current_user.role != UserRole.ATHLETE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only athletes can request mentorship"
        )

    # Verify mentor exists
    result = await db.execute(
        select(User).where(User.id == request_data.mentor_id, User.role == UserRole.MENTOR)
    )
    mentor = result.scalar_one_or_none()

    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )

    # Check for existing request
    result = await db.execute(
        select(MentorshipRequest).where(
            MentorshipRequest.athlete_id == current_user.id,
            MentorshipRequest.mentor_id == request_data.mentor_id,
            MentorshipRequest.status.in_([RequestStatus.PENDING, RequestStatus.PENDING_GUARDIAN, RequestStatus.APPROVED])
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active mentorship request already exists"
        )

    # Create request
    mentorship_request = MentorshipRequest(
        athlete_id=current_user.id,
        mentor_id=request_data.mentor_id,
        goal=request_data.goal,
        mode=MentorshipMode(request_data.mode) if request_data.mode else MentorshipMode.ONLINE,
        message=request_data.message,
        status=RequestStatus.PENDING
    )

    db.add(mentorship_request)
    await db.commit()
    await db.refresh(mentorship_request)

    return APIResponse(
        success=True,
        message="Mentorship request submitted",
        data=MentorshipRequestResponse.model_validate(mentorship_request)
    )


@router.get("/requests/incoming", response_model=APIResponse[List[MentorshipRequestResponse]])
async def get_incoming_requests(
    status_filter: Optional[RequestStatus] = Query(None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_mentor),
    db: AsyncSession = Depends(get_db)
):
    """Get incoming mentorship requests for mentor"""
    query = select(MentorshipRequest).where(
        MentorshipRequest.mentor_id == current_user.id
    )

    if status_filter:
        query = query.where(MentorshipRequest.status == status_filter)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(MentorshipRequest.created_at.desc())

    result = await db.execute(query)
    requests = result.scalars().all()

    return APIResponse(
        success=True,
        message="Requests retrieved",
        data=[MentorshipRequestResponse.model_validate(r) for r in requests],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.put("/requests/{request_id}/approve", response_model=APIResponse[MentorshipRequestResponse])
async def approve_mentorship_request(
    request_id: UUID,
    current_user: User = Depends(require_mentor),
    db: AsyncSession = Depends(get_db)
):
    """Approve a mentorship request"""
    result = await db.execute(
        select(MentorshipRequest).where(
            MentorshipRequest.id == request_id,
            MentorshipRequest.mentor_id == current_user.id
        )
    )
    mentorship_request = result.scalar_one_or_none()

    if not mentorship_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    if mentorship_request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not in pending state"
        )

    mentorship_request.status = RequestStatus.APPROVED
    await db.commit()
    await db.refresh(mentorship_request)

    return APIResponse(
        success=True,
        message="Mentorship request approved",
        data=MentorshipRequestResponse.model_validate(mentorship_request)
    )


@router.put("/requests/{request_id}/reject", response_model=APIResponse[MentorshipRequestResponse])
async def reject_mentorship_request(
    request_id: UUID,
    current_user: User = Depends(require_mentor),
    db: AsyncSession = Depends(get_db)
):
    """Reject a mentorship request"""
    result = await db.execute(
        select(MentorshipRequest).where(
            MentorshipRequest.id == request_id,
            MentorshipRequest.mentor_id == current_user.id
        )
    )
    mentorship_request = result.scalar_one_or_none()

    if not mentorship_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    if mentorship_request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not in pending state"
        )

    mentorship_request.status = RequestStatus.REJECTED
    await db.commit()
    await db.refresh(mentorship_request)

    return APIResponse(
        success=True,
        message="Mentorship request rejected",
        data=MentorshipRequestResponse.model_validate(mentorship_request)
    )


@router.get("/dashboard", response_model=APIResponse[dict])
async def get_mentor_dashboard(
    current_user: User = Depends(require_mentor),
    db: AsyncSession = Depends(get_db)
):
    """Get mentor dashboard with stats"""
    # Count mentees
    mentees = await db.execute(
        select(func.count(MentorshipRequest.id)).where(
            MentorshipRequest.mentor_id == current_user.id,
            MentorshipRequest.status == RequestStatus.APPROVED
        )
    )
    total_mentees = mentees.scalar() or 0

    # Pending requests
    pending = await db.execute(
        select(func.count(MentorshipRequest.id)).where(
            MentorshipRequest.mentor_id == current_user.id,
            MentorshipRequest.status == RequestStatus.PENDING
        )
    )
    pending_count = pending.scalar() or 0

    dashboard = {
        "total_mentees": total_mentees,
        "pending_requests": pending_count,
        "total_reviews": current_user.mentor_profile.total_reviews if current_user.mentor_profile else 0,
        "average_rating": current_user.mentor_profile.average_rating if current_user.mentor_profile else 0,
        "verified": current_user.mentor_profile.verified if current_user.mentor_profile else False,
    }

    return APIResponse(
        success=True,
        message="Dashboard retrieved",
        data=dashboard
    )
