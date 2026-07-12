"""
Athlete Schemas
Request/response schemas for athlete endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.models.athlete import AchievementLevel


class AthleteProfileBase(BaseModel):
    """Base athlete profile schema"""
    sport: str = Field(..., min_length=1, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    district: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    level: AchievementLevel = Field(default=AchievementLevel.DISTRICT)
    goals: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: str = Field(default="en", max_length=10)
    guardian_name: Optional[str] = Field(None, max_length=255)
    guardian_phone: Optional[str] = Field(None, max_length=20)
    guardian_email: Optional[str] = Field(None, max_length=255)


class AthleteProfileCreate(AthleteProfileBase):
    """Create athlete profile schema"""
    achievements: Optional[Dict[str, Any]] = None
    video_urls: Optional[Dict[str, Any]] = None
    visibility_settings: Optional[Dict[str, Any]] = None


class AthleteProfileUpdate(BaseModel):
    """Update athlete profile schema"""
    sport: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    level: Optional[AchievementLevel] = None
    goals: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: Optional[str] = Field(None, max_length=10)
    guardian_name: Optional[str] = Field(None, max_length=255)
    guardian_phone: Optional[str] = Field(None, max_length=20)
    guardian_email: Optional[str] = Field(None, max_length=255)
    achievements: Optional[Dict[str, Any]] = None
    video_urls: Optional[Dict[str, Any]] = None
    visibility_settings: Optional[Dict[str, Any]] = None


class AthleteProfileResponse(BaseModel):
    """Athlete profile response schema"""
    id: str
    user_id: str
    sport: str
    position: Optional[str]
    district: str
    state: str
    level: AchievementLevel
    achievements: Optional[Dict[str, Any]]
    video_urls: Optional[Dict[str, Any]]
    goals: Optional[str]
    bio: Optional[str]
    preferred_language: str
    guardian_name: Optional[str]
    guardian_phone: Optional[str]
    guardian_email: Optional[str]
    profile_completion: int
    visibility_settings: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    user: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class AthleteDashboard(BaseModel):
    """Athlete dashboard data"""
    profile_completion: int
    saved_scholarships_count: int
    pending_mentorship_requests: int
    active_mentorships: int
    available_opportunities: int
    upcoming_deadlines: List[Dict[str, Any]]
    recent_notifications_count: int
    recommended_mentors: List[Dict[str, Any]]
    matched_scholarships: List[Dict[str, Any]]
    matched_colleges: List[Dict[str, Any]]
