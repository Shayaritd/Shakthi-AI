"""
Review Schemas
Request/response schemas for mentor review endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class MentorReviewCreate(BaseModel):
    """Create mentor review schema"""
    mentor_id: str
    mentorship_request_id: Optional[str] = None
    respectful: int = Field(..., ge=1, le=5)
    helpful: int = Field(..., ge=1, le=5)
    knowledgeable: int = Field(..., ge=1, le=5)
    safe_communication: int = Field(..., ge=1, le=5)
    punctual: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    private_safety_flag: bool = False
    safety_concern: Optional[str] = None

    @field_validator("private_safety_flag")
    @classmethod
    def validate_safety_flag(cls, v, info):
        if v and not info.data.get("safety_concern"):
            raise ValueError("Safety concern description required when flagging")
        return v


class MentorReviewUpdate(BaseModel):
    """Update mentor review schema"""
    respectful: Optional[int] = Field(None, ge=1, le=5)
    helpful: Optional[int] = Field(None, ge=1, le=5)
    knowledgeable: Optional[int] = Field(None, ge=1, le=5)
    safe_communication: Optional[int] = Field(None, ge=1, le=5)
    punctual: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    visible: Optional[bool] = None


class MentorReviewResponse(BaseModel):
    """Mentor review response schema"""
    id: str
    mentor_id: str
    athlete_id: str
    mentorship_request_id: Optional[str]
    respectful: int
    helpful: int
    knowledgeable: int
    safe_communication: int
    punctual: int
    overall_rating: float
    comment: Optional[str]
    private_safety_flag: bool
    moderated: bool
    visible: bool
    created_at: datetime
    updated_at: datetime
    athlete: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class MentorReviewFilter(BaseModel):
    """Mentor review filter parameters"""
    mentor_id: Optional[str] = None
    athlete_id: Optional[str] = None
    min_rating: Optional[float] = None
    max_rating: Optional[float] = None
    has_safety_flag: Optional[bool] = None
