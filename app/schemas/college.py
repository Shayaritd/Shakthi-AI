"""
College Schemas
Request/response schemas for college endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import date, datetime


class CollegeBase(BaseModel):
    """Base college schema"""
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    state: Optional[str] = None
    sports_quota: bool = False
    fee_concession: Optional[str] = None
    hostel: bool = False
    supported_sports: Optional[Dict[str, Any]] = None
    quota_rules: Optional[str] = None
    required_achievement_level: Optional[str] = None
    academic_streams: Optional[Dict[str, Any]] = None
    last_date: Optional[date] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class CollegeCreate(CollegeBase):
    """Create college schema"""
    pass


class CollegeUpdate(BaseModel):
    """Update college schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    state: Optional[str] = None
    sports_quota: Optional[bool] = None
    fee_concession: Optional[str] = None
    hostel: Optional[bool] = None
    supported_sports: Optional[Dict[str, Any]] = None
    quota_rules: Optional[str] = None
    required_achievement_level: Optional[str] = None
    academic_streams: Optional[Dict[str, Any]] = None
    last_date: Optional[date] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class CollegeResponse(BaseModel):
    """College response schema"""
    id: str
    name: str
    location: str
    state: Optional[str]
    sports_quota: bool
    fee_concession: Optional[str]
    hostel: bool
    supported_sports: Optional[Dict[str, Any]]
    quota_rules: Optional[str]
    required_achievement_level: Optional[str]
    academic_streams: Optional[Dict[str, Any]]
    last_date: Optional[date]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    website: Optional[str]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollegeFilter(BaseModel):
    """College filter parameters"""
    state: Optional[str] = None
    sport: Optional[str] = None
    sports_quota: Optional[bool] = None
    hostel: Optional[bool] = None
    fee_concession_min: Optional[int] = None
    search: Optional[str] = None
