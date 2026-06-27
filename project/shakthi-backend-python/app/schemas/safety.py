"""
Safety Schemas
Request/response schemas for safety reports
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.models.safety_report import (
    ReportCategory, ReportSeverity, ReportStatus
)


class SafetyReportBase(BaseModel):
    """Base safety report schema"""
    category: ReportCategory
    severity: ReportSeverity = ReportSeverity.NORMAL
    description: str = Field(..., min_length=10)
    anonymous: bool = False
    evidence_urls: Optional[Dict[str, Any]] = None


class SafetyReportCreate(SafetyReportBase):
    """Create safety report schema"""
    reported_user_id: Optional[str] = None

    @field_validator("description")
    @classmethod
    def validate_description(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Description must be at least 10 characters")
        return v


class SafetyReportUpdate(BaseModel):
    """Update safety report schema"""
    category: Optional[ReportCategory] = None
    severity: Optional[ReportSeverity] = None
    description: Optional[str] = Field(None, min_length=10)
    evidence_urls: Optional[Dict[str, Any]] = None


class SafetyReportResponse(BaseModel):
    """Safety report response schema"""
    id: str
    ticket_id: str
    reporter_id: Optional[str]
    reported_id: Optional[str]
    category: ReportCategory
    severity: ReportSeverity
    description: str
    anonymous: bool
    evidence_urls: Optional[Dict[str, Any]]
    status: ReportStatus
    assigned_to: Optional[str]
    resolution_notes: Optional[str]
    resolved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    reporter: Optional[Dict[str, Any]] = None
    reported_user: Optional[Dict[str, Any]] = None
    assigned_officer: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class SafetyReportStatusUpdate(BaseModel):
    """Update safety report status"""
    status: ReportStatus
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None


class ReportTimelineResponse(BaseModel):
    """Report timeline event response"""
    id: str
    report_id: str
    action: str
    description: Optional[str]
    performed_by: Optional[str]
    created_at: datetime
    performer: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class SafetyReportFilter(BaseModel):
    """Safety report filter parameters"""
    status: Optional[ReportStatus] = None
    category: Optional[ReportCategory] = None
    severity: Optional[ReportSeverity] = None
    assigned_to: Optional[str] = None
    reporter_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


# Import field_validator
from pydantic import field_validator
