"""
Safety Report Schemas
Pydantic models for safety reports
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

from app.models.safety_report import ReportCategory, ReportSeverity, ReportStatus


class SafetyReportBase(BaseModel):
    """Base safety report schema"""
    reported_id: Optional[str] = None
    category: ReportCategory
    severity: ReportSeverity = ReportSeverity.NORMAL
    description: str = Field(..., min_length=10, max_length=5000)
    anonymous: bool = False
    evidence_urls: Optional[List[str]] = None


class SafetyReportCreate(SafetyReportBase):
    """Schema for creating a safety report"""
    
    @field_validator("description")
    def validate_description(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Description must be at least 10 characters")
        return v.strip()


class SafetyReportUpdate(BaseModel):
    """Schema for updating a safety report"""
    status: Optional[ReportStatus] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None


class SafetyReportStatusUpdate(BaseModel):
    """Schema for updating safety report status only"""
    status: ReportStatus
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True


class SafetyReportResponse(SafetyReportBase):
    """Schema for safety report response"""
    id: str
    ticket_id: str
    reporter_id: Optional[str] = None
    status: ReportStatus
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportTimelineResponse(BaseModel):
    """Schema for report timeline response"""
    id: str
    report_id: str
    status: ReportStatus
    note: Optional[str] = None
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True