"""
Mentorship Request Model
Request for mentorship between athlete and mentor
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Boolean, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class RequestStatus(str, enum.Enum):
    """Mentorship request status"""
    PENDING = "PENDING"
    PENDING_GUARDIAN = "PENDING_GUARDIAN"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MentorshipMode(str, enum.Enum):
    """Mode of mentorship"""
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    GROUP = "GROUP"
    CAREER_GUIDANCE = "CAREER_GUIDANCE"
    TRIAL_PREP = "TRIAL_PREP"
    SCHOLARSHIP_GUIDANCE = "SCHOLARSHIP_GUIDANCE"


class MentorshipRequest(Base):
    """Mentorship request between athlete and mentor"""
    __tablename__ = "mentorship_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    athlete_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    mentor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    guardian_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus),
        default=RequestStatus.PENDING,
        nullable=False,
        index=True
    )
    goal: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mode: Mapped[MentorshipMode] = mapped_column(
        Enum(MentorshipMode),
        default=MentorshipMode.ONLINE,
        nullable=False
    )
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    guardian_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    guardian_approval_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
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

    # ==================== RELATIONSHIPS ====================
    athlete: Mapped["User"] = relationship(
        "User",
        foreign_keys=[athlete_id],
        back_populates="mentorship_requests_as_athlete",
        lazy="selectin"
    )
    mentor: Mapped["User"] = relationship(
        "User",
        foreign_keys=[mentor_id],
        back_populates="mentorship_requests_as_mentor",
        lazy="selectin"
    )
    guardian: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[guardian_id],
        back_populates="mentorship_requests_as_guardian",
        lazy="selectin"
    )
    chat_thread: Mapped[Optional["ChatThread"]] = relationship(
        "ChatThread",
        back_populates="mentorship_request",
        uselist=False,
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<MentorshipRequest {self.athlete_id} -> {self.mentor_id} ({self.status})>"