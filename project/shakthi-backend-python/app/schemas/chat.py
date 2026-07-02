"""
Chat Schemas
Request/response schemas for chat endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ChatThreadCreate(BaseModel):
    """Create chat thread schema"""
    mentor_id: str
    mentorship_request_id: Optional[str] = None


class ChatThreadResponse(BaseModel):
    """Chat thread response schema"""
    id: str
    athlete_id: str
    mentor_id: str
    mentorship_request_id: Optional[str]
    is_active: bool
    is_blocked: bool
    last_message_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    athlete: Optional[Dict[str, Any]] = None
    mentor: Optional[Dict[str, Any]] = None
    last_message: Optional[Dict[str, Any]] = None
    unread_count: int = 0

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    """Create chat message schema"""
    content: str = Field(..., min_length=1, max_length=5000)
    attachment_urls: Optional[Dict[str, Any]] = None
    guardian_visible: bool = True


class ChatMessageResponse(BaseModel):
    """Chat message response schema"""
    id: str
    thread_id: str
    sender_id: str
    content: str
    read: bool
    read_at: Optional[datetime]
    attachment_urls: Optional[Dict[str, Any]]
    moderation_flag: bool
    guardian_visible: bool
    is_system_message: bool
    created_at: datetime
    sender: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ChatMessageFilter(BaseModel):
    """Chat message filter parameters"""
    before: Optional[datetime] = None
    after: Optional[datetime] = None
    limit: int = Field(default=50, ge=1, le=100)


class ChatReportCreate(BaseModel):
    """Report a chat message"""
    message_id: str
    reason: str = Field(..., min_length=10)
    category: Optional[str] = None


class ChatBlockRequest(BaseModel):
    """Block a chat thread"""
    reason: Optional[str] = None
