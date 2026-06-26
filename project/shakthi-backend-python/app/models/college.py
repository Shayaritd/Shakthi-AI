"""
College Model
Sports quota colleges and universities
"""
import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Text, Date, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class College(Base):
    """College with sports quota and facilities"""
    __tablename__ = "colleges"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    sports_quota: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    fee_concession: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    hostel: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    supported_sports: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    quota_rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required_achievement_level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    academic_streams: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    last_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
        return f"<College {self.name} - {self.location}>"
