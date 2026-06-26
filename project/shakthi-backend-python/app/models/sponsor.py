"""
Sponsor Program Model
Sponsorship and grant programs
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.database import Base


class SponsorType(str, enum.Enum):
    """Types of sponsor programs"""
    EQUIPMENT = "EQUIPMENT"
    TRAVEL = "TRAVEL"
    TOURNAMENT_FEE = "TOURNAMENT_FEE"
    GRANT = "GRANT"
    TRAINING = "TRAINING"
    NUTRITION = "NUTRITION"
    EDUCATION = "EDUCATION"
    GENERAL = "GENERAL"


class SponsorStatus(str, enum.Enum):
    """Status of sponsor program"""
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    UNDER_REVIEW = "UNDER_REVIEW"
    AWARDED = "AWARDED"


class SponsorProgram(Base):
    """Sponsorship program"""
    __tablename__ = "sponsor_programs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    sponsor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[SponsorType] = mapped_column(
        Enum(SponsorType),
        nullable=False,
        index=True
    )
    amount: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    application_process: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[SponsorStatus] = mapped_column(
        Enum(SponsorStatus),
        default=SponsorStatus.OPEN,
        nullable=False,
        index=True
    )
    max_recipients: Mapped[Optional[int]] = mapped_column(nullable=True)
    current_recipients: Mapped[int] = mapped_column(default=0, nullable=False)
    sport: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    women_focused: Mapped[bool] = mapped_column(default=False, nullable=False)
    application_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    requirements: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
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

    def __repr__(self) -> str:
        return f"<SponsorProgram {self.name} - {self.sponsor_name}>"
