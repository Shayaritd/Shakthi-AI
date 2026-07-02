"""
Opportunity Model
Sports opportunities: tournaments, trials, camps, schemes
"""
import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, Date, DateTime, Boolean, Enum, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class OpportunityType(str, enum.Enum):
    """Types of opportunities"""
    TOURNAMENT = "TOURNAMENT"
    TRIAL = "TRIAL"
    CAMP = "CAMP"
    GOVERNMENT_SCHEME = "GOVERNMENT_SCHEME"
    ACADEMY = "ACADEMY"
    SCHOLARSHIP = "SCHOLARSHIP"
    INTERNSHIP = "INTERNSHIP"
    JOB = "JOB"


class Opportunity(Base):
    """Sports opportunity listing"""
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[OpportunityType] = mapped_column(
        Enum(OpportunityType),
        nullable=False,
        index=True
    )
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sport: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    women_focused: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    age_range: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    application_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    benefits: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
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
        return f"<Opportunity {self.title} ({self.type})>"
