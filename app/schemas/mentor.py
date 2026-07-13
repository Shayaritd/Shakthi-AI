"""
Mentor Schemas
Request/response schemas for mentor endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum


class MentorProfileBase(BaseModel):
    """Base mentor profile schema"""
    expertise: str = Field(..., min_length=1, max_length=255)
    experience_years: int = Field(..., ge=0, le=50)
    availability: Optional[str] = Field(None, max_length=50)
    training_philosophy: Optional[str] = None
    bio: Optional[str] = None
    district: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    response_time: Optional[str] = Field(None, max_length=50)


class MentorProfileCreate(MentorProfileBase):
    """Create mentor profile schema"""
    certifications: Optional[Dict[str, Any]] = None
    languages: Optional[List[str]] = None
    code_of_conduct_accepted: bool = Field(default=False)

    @field_validator("code_of_conduct_accepted")
    @classmethod
    def must_accept_conduct(cls, v):
        if not v:
            raise ValueError("Code of conduct must be accepted")
        return v


class MentorProfileUpdate(BaseModel):
    """Update mentor profile schema"""
    expertise: Optional[str] = Field(None, min_length=1, max_length=255)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    availability: Optional[str] = Field(None, max_length=50)
    training_philosophy: Optional[str] = None
    bio: Optional[str] = None
    district: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    response_time: Optional[str] = Field(None, max_length=50)
    certifications: Optional[Dict[str, Any]] = None
    languages: Optional[List[str]] = None


class MentorProfileResponse(BaseModel):
    """Mentor profile response schema"""
    id: str
    user_id: str
    expertise: str
    experience_years: int
    verified: bool
    certifications: Optional[Dict[str, Any]]
    languages: Optional[List[str]]
    trust_score: float
    availability: Optional[str]
    training_philosophy: Optional[str]
    bio: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    code_of_conduct_accepted: bool
    response_time: Optional[str]
    total_reviews: int
    average_rating: float
    created_at: datetime
    updated_at: datetime
    user: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class MentorFilter(BaseModel):
    """Mentor filter parameters"""
    sport: Optional[str] = None
    expertise: Optional[str] = None
    verified: Optional[bool] = None
    min_experience: Optional[int] = None
    max_experience: Optional[int] = None
    language: Optional[str] = None
    state: Optional[str] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    availability: Optional[str] = None


class MentorDashboard(BaseModel):
    """Mentor dashboard data"""
    total_mentees: int
    active_mentorships: int
    pending_requests: int
    completed_mentorships: int
    average_rating: float
    total_reviews: int
    response_rate: float
    recent_activities: List[Dict[str, Any]]
    upcoming_sessions: List[Dict[str, Any]]
    pending_verifications: int


class MentorshipRequestCreate(BaseModel):
    """Create mentorship request schema"""
    mentor_id: str
    goal: Optional[str] = Field(None, max_length=255)
    mode: str = Field(default="ONLINE")
    message: Optional[str] = None


class MentorshipRequestResponse(BaseModel):
    """Mentorship request response schema"""
    id: str
    athlete_id: str
    mentor_id: str
    guardian_id: Optional[str]
    status: str
    goal: Optional[str]
    mode: str
    message: Optional[str]
    guardian_approved: bool
    guardian_approval_date: Optional[datetime]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    athlete: Optional[Dict[str, Any]] = None
    mentor: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class MentorshipRequestUpdate(BaseModel):
    """Update mentorship request schema"""
    status: Optional[str] = None
    guardian_approved: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
