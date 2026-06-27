"""
Sponsor Routes
Sponsorship programs
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.sponsor import SponsorProgram, SponsorType, SponsorStatus
from app.schemas.sponsor import (
    SponsorProgramCreate, SponsorProgramUpdate, SponsorProgramResponse, SponsorFilter
)
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[SponsorProgramResponse]])
async def list_sponsor_programs(
    type: Optional[SponsorType] = Query(None),
    status: Optional[SponsorStatus] = Query(None),
    sport: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    women_focused: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List sponsor programs"""
    query = select(SponsorProgram).where(SponsorProgram.status == SponsorStatus.OPEN)

    if type:
        query = query.where(SponsorProgram.type == type)

    if sport:
        query = query.where(
            or_(SponsorProgram.sport.is_(None), SponsorProgram.sport == sport)
        )

    if state:
        query = query.where(
            or_(SponsorProgram.state.is_(None), SponsorProgram.state == state)
        )

    if women_focused is not None:
        query = query.where(SponsorProgram.women_focused == women_focused)

    if search:
        query = query.where(
            or_(
                SponsorProgram.name.ilike(f"%{search}%"),
                SponsorProgram.sponsor_name.ilike(f"%{search}%"),
                SponsorProgram.description.ilike(f"%{search}%")
            )
        )

    # Only active programs
    query = query.where(
        or_(SponsorProgram.deadline.is_(None), SponsorProgram.deadline >= datetime.utcnow())
    )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(SponsorProgram.created_at.desc())

    result = await db.execute(query)
    programs = result.scalars().all()

    return APIResponse(
        success=True,
        message="Sponsor programs retrieved",
        data=[SponsorProgramResponse.model_validate(p) for p in programs],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/{program_id}", response_model=APIResponse[SponsorProgramResponse])
async def get_sponsor_program(
    program_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sponsor program details"""
    result = await db.execute(
        select(SponsorProgram).where(SponsorProgram.id == program_id)
    )
    program = result.scalar_one_or_none()

    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor program not found"
        )

    return APIResponse(
        success=True,
        message="Sponsor program retrieved",
        data=SponsorProgramResponse.model_validate(program)
    )
