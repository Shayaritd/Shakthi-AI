"""
Training Resource Schemas
Request/response schemas for training endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.training_resource import TrainingCategory


class TrainingResourceBase(BaseModel):
    """Base training resource schema"""
    title: str = Field(..., min_length=1, max_length=255)
    category: TrainingCategory
    content: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    author: Optional[str] = None
    duration: Optional[str] = None
    sport: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None


class TrainingResourceCreate(TrainingResourceBase):
    """Create training resource schema"""
    pass


class TrainingResourceUpdate(BaseModel):
    """Update training resource schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[TrainingCategory] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    author: Optional[str] = None
    duration: Optional[str] = None
    sport: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None
    is_published: Optional[bool] = None


class TrainingResourceResponse(BaseModel):
    """Training resource response schema"""
    id: str
    title: str
    category: TrainingCategory
    content: Optional[str]
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    author: Optional[str]
    duration: Optional[str]
    sport: Optional[str]
    difficulty_level: Optional[str]
    tags: Optional[Dict[str, Any]]
    view_count: int
    created_by: Optional[str]
    is_published: bool
    created_at: datetime
    updated_at: datetime
    author_user: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class TrainingFilter(BaseModel):
    """Training resource filter parameters"""
    category: Optional[TrainingCategory] = None
    sport: Optional[str] = None
    difficulty_level: Optional[str] = None
    search: Optional[str] = None
    is_published: Optional[bool] = True
