"""
Scholarship Schemas
Request/response schemas for scholarship endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from enum import Enum

from app.models.scholarship import SavedStatus


class ScholarshipBase(BaseModel):
    """Base scholarship schema"""
    name: str = Field(..., min_length=1, max_length=255)
    provider: str = Field(..., min_length=1, max_length=255)
    amount: str = Field(..., min_length=1, max_length=100)
    eligibility: Optional[str] = None
    deadline: date
    state: Optional[str] = None
    sport: Optional[str] = None
    girls_only: bool = False
    hostel_support: bool = False
    application_mode: Optional[str] = None
    description: Optional[str] = None
    application_url: Optional[str] = None


class ScholarshipCreate(ScholarshipBase):
    """Create scholarship schema"""
    documents_required: Optional[Dict[str, Any]] = None


class ScholarshipUpdate(BaseModel):
    """Update scholarship schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    provider: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[str] = Field(None, min_length=1, max_length=100)
    eligibility: Optional[str] = None
    deadline: Optional[date] = None
    state: Optional[str] = None
    sport: Optional[str] = None
    girls_only: Optional[bool] = None
    hostel_support: Optional[bool] = None
    application_mode: Optional[str] = None
    description: Optional[str] = None
    application_url: Optional[str] = None
    documents_required: Optional[Dict[str, Any]] = None


class ScholarshipResponse(BaseModel):
    """Scholarship response schema"""
    id: str
    name: str
    provider: str
    amount: str
    eligibility: Optional[str]
    deadline: date
    state: Optional[str]
    sport: Optional[str]
    girls_only: bool
    hostel_support: bool
    application_mode: Optional[str]
    description: Optional[str]
    application_url: Optional[str]
    documents_required: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    is_saved: bool = False
    saved_status: Optional[SavedStatus] = None

    class Config:
        from_attributes = True


class ScholarshipFilter(BaseModel):
    """Scholarship filter parameters"""
    sport: Optional[str] = None
    state: Optional[str] = None
    girls_only: Optional[bool] = None
    hostel_support: Optional[bool] = None
    deadline_after: Optional[date] = None
    deadline_before: Optional[date] = None
    search: Optional[str] = None
    min_amount: Optional[int] = None
    max_amount: Optional[int] = None


class SavedScholarshipCreate(BaseModel):
    """Save scholarship schema"""
    scholarship_id: str
    notes: Optional[str] = None


class SavedScholarshipUpdate(BaseModel):
    """Update saved scholarship schema"""
    status: Optional[SavedStatus] = None
    notes: Optional[str] = None


class SavedScholarshipResponse(BaseModel):
    """Saved scholarship response schema"""
    id: str
    user_id: str
    scholarship_id: str
    status: SavedStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    scholarship: Optional[ScholarshipResponse] = None

    class Config:
        from_attributes = True
