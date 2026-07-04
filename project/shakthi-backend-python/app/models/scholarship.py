"""
Scholarship Model
Scholarship opportunities for athletes
"""
import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Text, Date, DateTime, Boolean, Enum, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class SavedStatus(str, enum.Enum):
    """Status of saved scholarship"""
    SAVED = "SAVED"
    APPLYING = "APPLYING"
    SUBMITTED = "SUBMITTED"
    SHORTLISTED = "SHORTLISTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Scholarship(Base):
    """Scholarship opportunity"""
    __tablename__ = "scholarships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[str] = mapped_column(String(100), nullable=False)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    deadline: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    sport: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    girls_only: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    hostel_support: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    application_mode: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    application_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    documents_required: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
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
    saved_by: Mapped[List["SavedScholarship"]] = relationship(
        "SavedScholarship",
        back_populates="scholarship",
        lazy="selectin",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Scholarship {self.name} - {self.amount}>"


class SavedScholarship(Base):
    """Athlete's saved scholarships"""
    __tablename__ = "saved_scholarships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    scholarship_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scholarships.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    status: Mapped[SavedStatus] = mapped_column(
        Enum(SavedStatus),
        default=SavedStatus.SAVED,
        nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
    athlete: Mapped["User"] = relationship("User", lazy="selectin")
    scholarship: Mapped["Scholarship"] = relationship("Scholarship", back_populates="saved_by", lazy="selectin")

    def __repr__(self) -> str:
        return f"<SavedScholarship {self.user_id} -> {self.scholarship_id}>"


from app.models.user import User
