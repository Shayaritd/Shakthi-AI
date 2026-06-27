"""
Opportunity Schemas
Request/response schemas for opportunity endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import date, datetime

from app.models.opportunity import OpportunityType


class OpportunityBase(BaseModel):
    """Base opportunity schema"""
    title: str = Field(..., min_length=1, max_length=255)
    type: OpportunityType
    organization: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = None
    state: Optional[str] = None
    deadline: Optional[date] = None
    description: Optional[str] = None
    sport: Optional[str] = None
    eligibility: Optional[str] = None
    women_focused: bool = False
    age_range: Optional[str] = None
    application_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    benefits: Optional[Dict[str, Any]] = None
    requirements: Optional[Dict[str, Any]] = None


class OpportunityCreate(OpportunityBase):
    """Create opportunity schema"""
    pass


class OpportunityUpdate(BaseModel):
    """Update opportunity schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[OpportunityType] = None
    organization: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = None
    state: Optional[str] = None
    deadline: Optional[date] = None
    description: Optional[str] = None
    sport: Optional[str] = None
    eligibility: Optional[str] = None
    women_focused: Optional[bool] = None
    age_range: Optional[str] = None
    application_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    benefits: Optional[Dict[str, Any]] = None
    requirements: Optional[Dict[str, Any]] = None


class OpportunityResponse(BaseModel):
    """Opportunity response schema"""
    id: str
    title: str
    type: OpportunityType
    organization: str
    location: Optional[str]
    state: Optional[str]
    deadline: Optional[date]
    description: Optional[str]
    sport: Optional[str]
    eligibility: Optional[str]
    women_focused: bool
    age_range: Optional[str]
    application_url: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    benefits: Optional[Dict[str, Any]]
    requirements: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    is_saved: bool = False

    class Config:
        from_attributes = True


class OpportunityFilter(BaseModel):
    """Opportunity filter parameters"""
    type: Optional[OpportunityType] = None
    sport: Optional[str] = None
    state: Optional[str] = None
    women_focused: Optional[bool] = None
    deadline_after: Optional[date] = None
    search: Optional[str] = None
