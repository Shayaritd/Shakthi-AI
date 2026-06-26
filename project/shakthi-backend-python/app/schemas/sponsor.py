"""
Sponsor Schemas
Request/response schemas for sponsor program endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.sponsor import SponsorType, SponsorStatus


class SponsorProgramBase(BaseModel):
    """Base sponsor program schema"""
    name: str = Field(..., min_length=1, max_length=255)
    sponsor_name: str = Field(..., min_length=1, max_length=255)
    type: SponsorType
    amount: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    eligibility: Optional[str] = None
    application_process: Optional[str] = None
    deadline: Optional[datetime] = None
    max_recipients: Optional[int] = None
    sport: Optional[str] = None
    state: Optional[str] = None
    women_focused: bool = False
    application_url: Optional[str] = None
    contact_email: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None


class SponsorProgramCreate(SponsorProgramBase):
    """Create sponsor program schema"""
    pass


class SponsorProgramUpdate(BaseModel):
    """Update sponsor program schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sponsor_name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[SponsorType] = None
    amount: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    eligibility: Optional[str] = None
    application_process: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[SponsorStatus] = None
    max_recipients: Optional[int] = None
    sport: Optional[str] = None
    state: Optional[str] = None
    women_focused: Optional[bool] = None
    application_url: Optional[str] = None
    contact_email: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None


class SponsorProgramResponse(BaseModel):
    """Sponsor program response schema"""
    id: str
    name: str
    sponsor_name: str
    type: SponsorType
    amount: str
    description: Optional[str]
    eligibility: Optional[str]
    application_process: Optional[str]
    deadline: Optional[datetime]
    status: SponsorStatus
    max_recipients: Optional[int]
    current_recipients: int
    sport: Optional[str]
    state: Optional[str]
    women_focused: bool
    application_url: Optional[str]
    contact_email: Optional[str]
    requirements: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SponsorFilter(BaseModel):
    """Sponsor program filter parameters"""
    type: Optional[SponsorType] = None
    status: Optional[SponsorStatus] = None
    sport: Optional[str] = None
    state: Optional[str] = None
    women_focused: Optional[bool] = None
    deadline_after: Optional[datetime] = None
    search: Optional[str] = None
