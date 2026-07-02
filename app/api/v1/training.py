"""
Training Resource Routes
Educational content for athletes
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user, require_mentor, require_admin
from app.models.user import User
from app.models.training_resource import TrainingResource, TrainingCategory
from app.schemas.training import (
    TrainingResourceCreate, TrainingResourceUpdate, TrainingResourceResponse, TrainingFilter
)
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[TrainingResourceResponse]])
async def list_training_resources(
    category: Optional[TrainingCategory] = Query(None),
    sport: Optional[str] = Query(None),
    difficulty_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List training resources"""
    query = select(TrainingResource).where(TrainingResource.is_published == True)

    if category:
        query = query.where(TrainingResource.category == category)

    if sport:
        query = query.where(
            or_(TrainingResource.sport.is_(None), TrainingResource.sport == sport)
        )

    if difficulty_level:
        query = query.where(TrainingResource.difficulty_level == difficulty_level)

    if search:
        query = query.where(
            or_(
                TrainingResource.title.ilike(f"%{search}%"),
                TrainingResource.content.ilike(f"%{search}%")
            )
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(TrainingResource.created_at.desc())

    result = await db.execute(query)
    resources = result.scalars().all()

    return APIResponse(
        success=True,
        message="Training resources retrieved",
        data=[TrainingResourceResponse.model_validate(r) for r in resources],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/{resource_id}", response_model=APIResponse[TrainingResourceResponse])
async def get_training_resource(
    resource_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get training resource details"""
    result = await db.execute(
        select(TrainingResource).where(TrainingResource.id == resource_id)
    )
    resource = result.scalar_one_or_none()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training resource not found"
        )

    # Increment view count
    resource.view_count += 1
    await db.commit()

    return APIResponse(
        success=True,
        message="Training resource retrieved",
        data=TrainingResourceResponse.model_validate(resource)
    )


@router.post("/", response_model=APIResponse[TrainingResourceResponse], status_code=status.HTTP_201_CREATED)
async def create_training_resource(
    resource_data: TrainingResourceCreate,
    current_user: User = Depends(require_mentor),
    db: AsyncSession = Depends(get_db)
):
    """Create training resource (mentor/admin)"""
    resource = TrainingResource(
        **resource_data.model_dump(),
        created_by=current_user.id
    )

    db.add(resource)
    await db.commit()
    await db.refresh(resource)

    return APIResponse(
        success=True,
        message="Training resource created",
        data=TrainingResourceResponse.model_validate(resource)
    )


@router.put("/{resource_id}", response_model=APIResponse[TrainingResourceResponse])
async def update_training_resource(
    resource_id: UUID,
    update_data: TrainingResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update training resource (owner/admin)"""
    result = await db.execute(
        select(TrainingResource).where(TrainingResource.id == resource_id)
    )
    resource = result.scalar_one_or_none()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training resource not found"
        )

    # Check ownership or admin
    if resource.created_by != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this resource"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(resource, field, value)

    await db.commit()
    await db.refresh(resource)

    return APIResponse(
        success=True,
        message="Training resource updated",
        data=TrainingResourceResponse.model_validate(resource)
    )


@router.delete("/{resource_id}", response_model=APIResponse[dict])
async def delete_training_resource(
    resource_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete training resource (owner/admin)"""
    result = await db.execute(
        select(TrainingResource).where(TrainingResource.id == resource_id)
    )
    resource = result.scalar_one_or_none()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training resource not found"
        )

    # Check ownership or admin
    if resource.created_by != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this resource"
        )

    await db.delete(resource)
    await db.commit()

    return APIResponse(
        success=True,
        message="Training resource deleted"
    )
