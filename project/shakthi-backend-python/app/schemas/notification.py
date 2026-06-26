"""
Notification Schemas
Request/response schemas for notification endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    """Base notification schema"""
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    """Create notification schema"""
    user_id: str


class NotificationResponse(BaseModel):
    """Notification response schema"""
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    read: bool
    action_url: Optional[str]
    action_text: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationBulkCreate(BaseModel):
    """Bulk create notifications schema"""
    user_ids: List[str] = Field(..., min_items=1)
    notification: NotificationBase
