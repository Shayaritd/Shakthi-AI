"""
Athlete Profile Model
Extended profile information for athletes
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.mentorship_request import MentorshipRequest
    from app.models.scholarship import SavedScholarship
    from app.models.chat import ChatThread


class AchievementLevel(str, enum.Enum):
    """Athlete achievement/game level"""
    SCHOOL = "SCHOOL"
    DISTRICT = "DISTRICT"
    STATE = "STATE"
    NATIONAL = "NATIONAL"
    INTERNATIONAL = "INTERNATIONAL"


class AthleteProfile(Base):
    """Athlete profile with sports and personal details"""
    __tablename__ = "athlete_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    sport: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    position: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    level: Mapped[AchievementLevel] = mapped_column(
        Enum(AchievementLevel),
        nullable=False,
        default=AchievementLevel.DISTRICT
    )
    achievements: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    video_urls: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    goals: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    guardian_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    guardian_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    guardian_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    profile_completion: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    visibility_settings: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
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
    user: Mapped["User"] = relationship("User", back_populates="athlete_profile", lazy="selectin")
    mentorship_requests: Mapped[List["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        primaryjoin="AthleteProfile.user_id == MentorshipRequest.athlete_id",
        foreign_keys="[MentorshipRequest.athlete_id]",
        viewonly=True,
        lazy="selectin"
    )
    saved_scholarships: Mapped[List["SavedScholarship"]] = relationship(
        "SavedScholarship",
        primaryjoin="AthleteProfile.user_id == SavedScholarship.user_id",
        foreign_keys="[SavedScholarship.user_id]",
        viewonly=True,
        lazy="selectin"
    )
    chat_threads: Mapped[List["ChatThread"]] = relationship(
        "ChatThread",
        primaryjoin="AthleteProfile.user_id == ChatThread.athlete_id",
        foreign_keys="[ChatThread.athlete_id]",
        viewonly=True,
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<AthleteProfile {self.user_id} - {self.sport}>"

    def calculate_completion(self) -> int:
        """Calculate profile completion percentage"""
        fields = [
            self.sport,
            self.district,
            self.state,
            self.level,
            self.goals,
            self.bio,
            self.guardian_name,
            self.guardian_phone,
            self.achievements,
        ]
        completed = sum(1 for field in fields if field)
        return int((completed / len(fields)) * 100)
