"""
Safety Routes
Safety report submission and management
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import random
import string
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.config import settings
from app.core.dependencies import get_current_user, require_safety_officer, require_admin
from app.models.user import User, UserRole
from app.models.safety_report import SafetyReport, ReportTimeline, ReportCategory, ReportSeverity, ReportStatus
from app.schemas.safety import (
    SafetyReportCreate, SafetyReportResponse, SafetyReportStatusUpdate,
    ReportTimelineResponse
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta


router = APIRouter()


def generate_ticket_id() -> str:
    """Generate unique ticket ID"""
    prefix = settings.SAFETY_TICKET_PREFIX
    random_part = ''.join(random.choices(string.digits, k=8))
    return f"{prefix}-{random_part}"


@router.post("/reports", response_model=APIResponse[SafetyReportResponse], status_code=status.HTTP_201_CREATED)
async def submit_report(
    report_data: SafetyReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a safety report"""
    # Generate ticket ID
    ticket_id = generate_ticket_id()

    # Create report
    report = SafetyReport(
        ticket_id=ticket_id,
        reporter_id=current_user.id if not report_data.anonymous else None,
        reported_id=UUID(report_data.reported_user_id) if report_data.reported_user_id else None,
        category=report_data.category,
        severity=report_data.severity,
        description=report_data.description,
        anonymous=report_data.anonymous,
        evidence_urls=report_data.evidence_urls,
        status=ReportStatus.SUBMITTED
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Create timeline entry
    timeline = ReportTimeline(
        report_id=report.id,
        action="REPORT_SUBMITTED",
        description="Safety report submitted",
        performed_by=current_user.id if not report_data.anonymous else None
    )
    db.add(timeline)
    await db.commit()

    return APIResponse(
        success=True,
        message="Safety report submitted",
        data=SafetyReportResponse.model_validate(report)
    )


@router.get("/reports", response_model=APIResponse[List[SafetyReportResponse]])
async def get_user_reports(
    status_filter: Optional[ReportStatus] = Query(None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's own reports"""
    query = select(SafetyReport).where(
        SafetyReport.reporter_id == current_user.id
    )

    if status_filter:
        query = query.where(SafetyReport.status == status_filter)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(SafetyReport.created_at.desc())

    result = await db.execute(query)
    reports = result.scalars().all()

    return APIResponse(
        success=True,
        message="Reports retrieved",
        data=[SafetyReportResponse.model_validate(r) for r in reports],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/reports/{ticket_id}", response_model=APIResponse[SafetyReportResponse])
async def get_report_by_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get report by ticket ID"""
    result = await db.execute(
        select(SafetyReport).where(SafetyReport.ticket_id == ticket_id)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Check access
    if report.reporter_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.SAFETY_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return APIResponse(
        success=True,
        message="Report retrieved",
        data=SafetyReportResponse.model_validate(report)
    )


@router.get("/reports/{report_id}/timeline", response_model=APIResponse[List[ReportTimelineResponse]])
async def get_report_timeline(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get report timeline"""
    # Verify access
    result = await db.execute(
        select(SafetyReport).where(SafetyReport.id == report_id)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    if report.reporter_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.SAFETY_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Get timeline
    result = await db.execute(
        select(ReportTimeline)
        .where(ReportTimeline.report_id == report_id)
        .order_by(ReportTimeline.created_at.asc())
    )
    timeline = result.scalars().all()

    return APIResponse(
        success=True,
        message="Timeline retrieved",
        data=[ReportTimelineResponse.model_validate(t) for t in timeline]
    )


@router.put("/reports/{report_id}", response_model=APIResponse[SafetyReportResponse])
async def update_own_report(
    report_id: UUID,
    update_data: SafetyReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update own report (only if still submitted)"""
    result = await db.execute(
        select(SafetyReport).where(
            SafetyReport.id == report_id,
            SafetyReport.reporter_id == current_user.id
        )
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    if report.status != ReportStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update report that is already being processed"
        )

    # Update fields
    report.category = update_data.category
    report.severity = update_data.severity
    report.description = update_data.description
    report.evidence_urls = update_data.evidence_urls

    await db.commit()
    await db.refresh(report)

    return APIResponse(
        success=True,
        message="Report updated",
        data=SafetyReportResponse.model_validate(report)
    )


# Admin/Safety Officer endpoints
@router.get("/admin/reports", response_model=APIResponse[List[SafetyReportResponse]])
async def list_all_reports(
    status_filter: Optional[ReportStatus] = Query(None, alias="status"),
    category: Optional[ReportCategory] = Query(None),
    severity: Optional[ReportSeverity] = Query(None),
    assigned_to: Optional[UUID] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_safety_officer),
    db: AsyncSession = Depends(get_db)
):
    """List all reports (admin/safety officer)"""
    query = select(SafetyReport)

    if status_filter:
        query = query.where(SafetyReport.status == status_filter)

    if category:
        query = query.where(SafetyReport.category == category)

    if severity:
        query = query.where(SafetyReport.severity == severity)

    if assigned_to:
        query = query.where(SafetyReport.assigned_to == assigned_to)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(SafetyReport.severity.desc(), SafetyReport.created_at.desc())

    result = await db.execute(query)
    reports = result.scalars().all()

    return APIResponse(
        success=True,
        message="Reports retrieved",
        data=[SafetyReportResponse.model_validate(r) for r in reports],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.put("/admin/reports/{report_id}/status", response_model=APIResponse[SafetyReportResponse])
async def update_report_status(
    report_id: UUID,
    update_data: SafetyReportStatusUpdate,
    current_user: User = Depends(require_safety_officer),
    db: AsyncSession = Depends(get_db)
):
    """Update report status (admin/safety officer)"""
    result = await db.execute(
        select(SafetyReport).where(SafetyReport.id == report_id)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    old_status = report.status
    report.status = update_data.status

    if update_data.resolution_notes:
        report.resolution_notes = update_data.resolution_notes

    if update_data.assigned_to:
        report.assigned_to = update_data.assigned_to

    if update_data.status == ReportStatus.RESOLVED:
        report.resolved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(report)

    # Create timeline entry
    timeline = ReportTimeline(
        report_id=report.id,
        action=f"STATUS_CHANGED_{old_status.value}_TO_{update_data.status.value}",
        description=update_data.resolution_notes,
        performed_by=current_user.id
    )
    db.add(timeline)
    await db.commit()

    return APIResponse(
        success=True,
        message="Report status updated",
        data=SafetyReportResponse.model_validate(report)
    )


@router.put("/admin/reports/{report_id}/assign", response_model=APIResponse[SafetyReportResponse])
async def assign_report(
    report_id: UUID,
    officer_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Assign report to safety officer (admin only)"""
    result = await db.execute(
        select(SafetyReport).where(SafetyReport.id == report_id)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Verify officer
    officer_result = await db.execute(
        select(User).where(
            User.id == officer_id,
            User.role.in_([UserRole.SAFETY_OFFICER, UserRole.ADMIN])
        )
    )
    officer = officer_result.scalar_one_or_none()

    if not officer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid safety officer"
        )

    report.assigned_to = officer_id
    report.status = ReportStatus.UNDER_REVIEW

    await db.commit()
    await db.refresh(report)

    # Timeline
    timeline = ReportTimeline(
        report_id=report.id,
        action="ASSIGNED",
        description=f"Assigned to {officer.full_name}",
        performed_by=current_user.id
    )
    db.add(timeline)
    await db.commit()

    return APIResponse(
        success=True,
        message="Report assigned",
        data=SafetyReportResponse.model_validate(report)
    )
