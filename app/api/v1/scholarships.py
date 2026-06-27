"""
Scholarship Routes
Scholarship listing, search, and saved scholarships
"""
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.scholarship import Scholarship, SavedScholarship, SavedStatus
from app.schemas.scholarship import (
    ScholarshipCreate, ScholarshipUpdate, ScholarshipResponse,
    ScholarshipFilter, SavedScholarshipCreate, SavedScholarshipResponse, SavedScholarshipUpdate
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[ScholarshipResponse]])
async def list_scholarships(
    sport: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    girls_only: Optional[bool] = Query(None),
    hostel_support: Optional[bool] = Query(None),
    deadline_after: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List scholarships with filters"""
    query = select(Scholarship)

    # Apply filters
    if sport:
        query = query.where(
            or_(Scholarship.sport == None, Scholarship.sport == sport)
        )

    if state:
        query = query.where(
            or_(Scholarship.state == None, Scholarship.state == state)
        )

    if girls_only is not None:
        if girls_only:
            query = query.where(Scholarship.girls_only == True)

    if hostel_support is not None:
        if hostel_support:
            query = query.where(Scholarship.hostel_support == True)

    if deadline_after:
        query = query.where(Scholarship.deadline >= deadline_after)

    if search:
        query = query.where(
            or_(
                Scholarship.name.ilike(f"%{search}%"),
                Scholarship.provider.ilike(f"%{search}%"),
                Scholarship.description.ilike(f"%{search}%")
            )
        )

    # Only active scholarships
    query = query.where(Scholarship.deadline >= date.today())

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(Scholarship.deadline.asc())

    result = await db.execute(query)
    scholarships = result.scalars().all()

    # Check if saved by current user
    saved_result = await db.execute(
        select(SavedScholarship).where(SavedScholarship.user_id == current_user.id)
    )
    saved = {str(s.scholarship_id): s for s in saved_result.scalars().all()}

    response_data = []
    for s in scholarships:
        scholarship_dict = ScholarshipResponse.model_validate(s).model_dump()
        scholarship_dict["is_saved"] = str(s.id) in saved
        scholarship_dict["saved_status"] = saved.get(str(s.id), {}).get("status") if str(s.id) in saved else None
        response_data.append(scholarship_dict)

    return APIResponse(
        success=True,
        message="Scholarships retrieved",
        data=response_data,
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/{scholarship_id}", response_model=APIResponse[ScholarshipResponse])
async def get_scholarship(
    scholarship_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scholarship details"""
    result = await db.execute(
        select(Scholarship).where(Scholarship.id == scholarship_id)
    )
    scholarship = result.scalar_one_or_none()

    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship not found"
        )

    # Check if saved
    saved_result = await db.execute(
        select(SavedScholarship).where(
            SavedScholarship.user_id == current_user.id,
            SavedScholarship.scholarship_id == scholarship_id
        )
    )
    saved = saved_result.scalar_one_or_none()

    response_data = ScholarshipResponse.model_validate(scholarship).model_dump()
    response_data["is_saved"] = saved is not None
    response_data["saved_status"] = saved.status if saved else None

    return APIResponse(
        success=True,
        message="Scholarship retrieved",
        data=response_data
    )


@router.post("/{scholarship_id}/save", response_model=APIResponse[SavedScholarshipResponse], status_code=status.HTTP_201_CREATED)
async def save_scholarship(
    scholarship_id: UUID,
    save_data: Optional[SavedScholarshipCreate] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save a scholarship for later"""
    # Check scholarship exists
    result = await db.execute(
        select(Scholarship).where(Scholarship.id == scholarship_id)
    )
    scholarship = result.scalar_one_or_none()

    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship not found"
        )

    # Check if already saved
    existing_result = await db.execute(
        select(SavedScholarship).where(
            SavedScholarship.user_id == current_user.id,
            SavedScholarship.scholarship_id == scholarship_id
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scholarship already saved"
        )

    # Create saved scholarship
    saved = SavedScholarship(
        user_id=current_user.id,
        scholarship_id=scholarship_id,
        notes=save_data.notes if save_data else None,
        status=SavedStatus.SAVED
    )

    db.add(saved)
    await db.commit()
    await db.refresh(saved)

    return APIResponse(
        success=True,
        message="Scholarship saved",
        data=SavedScholarshipResponse.model_validate(saved)
    )


@router.delete("/{scholarship_id}/save", response_model=APIResponse[dict])
async def unsave_scholarship(
    scholarship_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove saved scholarship"""
    result = await db.execute(
        select(SavedScholarship).where(
            SavedScholarship.user_id == current_user.id,
            SavedScholarship.scholarship_id == scholarship_id
        )
    )
    saved = result.scalar_one_or_none()

    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved scholarship not found"
        )

    await db.delete(saved)
    await db.commit()

    return APIResponse(
        success=True,
        message="Scholarship removed from saved"
    )


@router.get("/saved/all", response_model=APIResponse[List[SavedScholarshipResponse]])
async def get_saved_scholarships(
    status_filter: Optional[SavedStatus] = Query(None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's saved scholarships"""
    query = select(SavedScholarship).where(
        SavedScholarship.user_id == current_user.id
    ).options(selectinload(SavedScholarship.scholarship))

    if status_filter:
        query = query.where(SavedScholarship.status == status_filter)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(SavedScholarship.created_at.desc())

    result = await db.execute(query)
    saved = result.scalars().all()

    return APIResponse(
        success=True,
        message="Saved scholarships retrieved",
        data=[SavedScholarshipResponse.model_validate(s) for s in saved],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.put("/saved/{saved_id}", response_model=APIResponse[SavedScholarshipResponse])
async def update_saved_scholarship(
    saved_id: UUID,
    update_data: SavedScholarshipUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update saved scholarship status"""
    result = await db.execute(
        select(SavedScholarship).where(
            SavedScholarship.id == saved_id,
            SavedScholarship.user_id == current_user.id
        )
    )
    saved = result.scalar_one_or_none()

    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved scholarship not found"
        )

    if update_data.status:
        saved.status = update_data.status

    if update_data.notes is not None:
        saved.notes = update_data.notes

    await db.commit()
    await db.refresh(saved)

    return APIResponse(
        success=True,
        message="Saved scholarship updated",
        data=SavedScholarshipResponse.model_validate(saved)
    )
