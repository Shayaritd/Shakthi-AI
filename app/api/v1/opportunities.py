"""
Opportunity Routes
Sports opportunities: tournaments, trials, camps
"""
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.opportunity import Opportunity, OpportunityType
from app.schemas.opportunity import (
    OpportunityCreate, OpportunityUpdate, OpportunityResponse, OpportunityFilter
)
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[OpportunityResponse]])
async def list_opportunities(
    type: Optional[OpportunityType] = Query(None),
    sport: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    women_focused: Optional[bool] = Query(None),
    deadline_after: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List opportunities with filters"""
    query = select(Opportunity)

    if type:
        query = query.where(Opportunity.type == type)

    if sport:
        query = query.where(
            or_(Opportunity.sport.is_(None), Opportunity.sport == sport)
        )

    if state:
        query = query.where(
            or_(Opportunity.state.is_(None), Opportunity.state == state)
        )

    if women_focused is not None:
        query = query.where(Opportunity.women_focused == women_focused)

    if deadline_after:
        query = query.where(
            or_(Opportunity.deadline.is_(None), Opportunity.deadline >= deadline_after)
        )

    if search:
        query = query.where(
            or_(
                Opportunity.title.ilike(f"%{search}%"),
                Opportunity.organization.ilike(f"%{search}%"),
                Opportunity.description.ilike(f"%{search}%")
            )
        )

    # Only active opportunities
    query = query.where(
        or_(Opportunity.deadline.is_(None), Opportunity.deadline >= date.today())
    )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(Opportunity.deadline.asc().nulls_last())

    result = await db.execute(query)
    opportunities = result.scalars().all()

    return APIResponse(
        success=True,
        message="Opportunities retrieved",
        data=[OpportunityResponse.model_validate(o) for o in opportunities],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/{opportunity_id}", response_model=APIResponse[OpportunityResponse])
async def get_opportunity(
    opportunity_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get opportunity details"""
    result = await db.execute(
        select(Opportunity).where(Opportunity.id == opportunity_id)
    )
    opportunity = result.scalar_one_or_none()

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    return APIResponse(
        success=True,
        message="Opportunity retrieved",
        data=OpportunityResponse.model_validate(opportunity)
    )
