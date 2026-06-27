"""
Safety Report Model
Safety concern reporting system
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, DateTime, Boolean, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class ReportCategory(str, enum.Enum):
    """Categories of safety reports"""
    HARASSMENT = "HARASSMENT"
    INAPPROPRIATE_LANGUAGE = "INAPPROPRIATE_LANGUAGE"
    FRAUD = "FRAUD"
    UNSAFE_MEETING = "UNSAFE_MEETING"
    PRESSURE = "PRESSURE"
    DISCRIMINATION = "DISCRIMINATION"
    MISUSE_CONTENT = "MISUSE_CONTENT"
    FINANCIAL_MISCONDUCT = "FINANCIAL_MISCONDUCT"
    PRIVACY_VIOLATION = "PRIVACY_VIOLATION"
    OTHER = "OTHER"


class ReportSeverity(str, enum.Enum):
    """Severity levels for safety reports"""
    NORMAL = "NORMAL"
    URGENT = "URGENT"
    EMERGENCY = "EMERGENCY"


class ReportStatus(str, enum.Enum):
    """Status of safety report"""
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class SafetyReport(Base):
    """Safety concern report"""
    __tablename__ = "safety_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    ticket_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    reported_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    category: Mapped[ReportCategory] = mapped_column(
        Enum(ReportCategory),
        nullable=False,
        index=True
    )
    severity: Mapped[ReportSeverity] = mapped_column(
        Enum(ReportSeverity),
        default=ReportSeverity.NORMAL,
        nullable=False,
        index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    evidence_urls: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus),
        default=ReportStatus.SUBMITTED,
        nullable=False,
        index=True
    )
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    reporter: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[reporter_id],
        lazy="selectin"
    )
    reported_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[reported_id],
        lazy="selectin"
    )
    assigned_officer: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[assigned_to],
        lazy="selectin"
    )
    timeline: Mapped[List["ReportTimeline"]] = relationship(
        "ReportTimeline",
        back_populates="report",
        lazy="selectin",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<SafetyReport {self.ticket_id} - {self.status}>"


class ReportTimeline(Base):
    """Timeline events for safety reports"""
    __tablename__ = "report_timeline"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("safety_reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    performed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    report: Mapped["SafetyReport"] = relationship("SafetyReport", back_populates="timeline", lazy="selectin")
    performer: Mapped[Optional["User"]] = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ReportTimeline {self.report_id} - {self.action}>"


from typing import List
from app.models.user import User
