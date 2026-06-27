"""
Notification Routes
User notifications
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationBulkCreate
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/", response_model=APIResponse[List[NotificationResponse]])
async def get_notifications(
    type: Optional[NotificationType] = Query(None),
    unread_only: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's notifications"""
    query = select(Notification).where(Notification.user_id == current_user.id)

    if type:
        query = query.where(Notification.type == type)

    if unread_only:
        query = query.where(Notification.read == False)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(Notification.created_at.desc())

    result = await db.execute(query)
    notifications = result.scalars().all()

    return APIResponse(
        success=True,
        message="Notifications retrieved",
        data=[NotificationResponse.model_validate(n) for n in notifications],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/count", response_model=APIResponse[dict])
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get unread notification count"""
    result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.read == False
        )
    )
    count = result.scalar() or 0

    return APIResponse(
        success=True,
        message="Unread count retrieved",
        data={"unread_count": count}
    )


@router.put("/{notification_id}/read", response_model=APIResponse[NotificationResponse])
async def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark notification as read"""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.read = True
    notification.read_at = datetime.utcnow()

    await db.commit()
    await db.refresh(notification)

    return APIResponse(
        success=True,
        message="Notification marked as read",
        data=NotificationResponse.model_validate(notification)
    )


@router.put("/read-all", response_model=APIResponse[dict])
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read"""
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.read == False
        )
        .values(read=True, read_at=datetime.utcnow())
    )
    await db.commit()

    return APIResponse(
        success=True,
        message="All notifications marked as read"
    )


@router.delete("/{notification_id}", response_model=APIResponse[dict])
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a notification"""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    await db.delete(notification)
    await db.commit()

    return APIResponse(
        success=True,
        message="Notification deleted"
    )


# Internal helper for creating notifications
async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    type: NotificationType,
    title: str,
    message: str,
    action_url: Optional[str] = None,
    action_text: Optional[str] = None,
    metadata: Optional[dict] = None
) -> Notification:
    """Helper to create a notification"""
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        action_url=action_url,
        action_text=action_text,
        metadata=metadata
    )
    db.add(notification)
    await db.commit()
    return notification
