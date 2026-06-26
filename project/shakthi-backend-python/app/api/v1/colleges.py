"""
College Routes
Sports quota colleges listing and matching
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from datetime import date

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.college import College
from app.schemas.college import (
    CollegeCreate, CollegeUpdate, CollegeResponse, CollegeFilter
)
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[CollegeResponse]])
async def list_colleges(
    state: Optional[str] = Query(None),
    sport: Optional[str] = Query(None),
    sports_quota: Optional[bool] = Query(None),
    hostel: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List colleges with sports quota"""
    query = select(College)

    # Filters
    if state:
        query = query.where(College.state == state)

    if sports_quota is not None:
        query = query.where(College.sports_quota == sports_quota)

    if hostel is not None:
        query = query.where(College.hostel == hostel)

    if sport:
        query = query.where(
            or_(
                College.supported_sports.is_(None),
                College.supported_sports.astext.ilike(f"%{sport}%")
            )
        )

    if search:
        query = query.where(
            or_(
                College.name.ilike(f"%{search}%"),
                College.location.ilike(f"%{search}%")
            )
        )

    # Only colleges with active last_date
    query = query.where(
        or_(College.last_date.is_(None), College.last_date >= date.today())
    )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(College.name)

    result = await db.execute(query)
    colleges = result.scalars().all()

    return APIResponse(
        success=True,
        message="Colleges retrieved",
        data=[CollegeResponse.model_validate(c) for c in colleges],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/{college_id}", response_model=APIResponse[CollegeResponse])
async def get_college(
    college_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get college details"""
    result = await db.execute(
        select(College).where(College.id == college_id)
    )
    college = result.scalar_one_or_none()

    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found"
        )

    return APIResponse(
        success=True,
        message="College retrieved",
        data=CollegeResponse.model_validate(college)
    )


@router.get("/matches/list", response_model=APIResponse[List[dict]])
async def get_matched_colleges(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-matched colleges for current athlete"""
    if not current_user.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Athlete profile required"
        )

    profile = current_user.athlete_profile

    # TODO: Implement AI matching
    # Simple matching for now
    query = select(College).where(
        or_(College.last_date.is_(None), College.last_date >= date.today()),
        College.sports_quota == True
    ).limit(limit)

    result = await db.execute(query)
    colleges = result.scalars().all()

    matches = [
        {
            "id": str(c.id),
            "name": c.name,
            "location": c.location,
            "fee_concession": c.fee_concession,
            "hostel": c.hostel,
            "match_score": 75,  # Placeholder
        }
        for c in colleges
    ]

    return APIResponse(
        success=True,
        message="Matched colleges retrieved",
        data=matches
    )
