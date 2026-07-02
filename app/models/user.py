"""
User Model
Core user model with role-based access
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """User roles in the SHAKTHI platform"""
    ATHLETE = "ATHLETE"
    MENTOR = "MENTOR"
    GUARDIAN = "GUARDIAN"
    ADMIN = "ADMIN"
    SAFETY_OFFICER = "SAFETY_OFFICER"
    COACH = "COACH"
    SPONSOR = "SPONSOR"


class User(Base):
    """User model for all platform users"""
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.ATHLETE)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
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
    athlete_profile: Mapped[Optional["AthleteProfile"]] = relationship(
        "AthleteProfile",
        back_populates="user",
        uselist=False,
        lazy="selectin"
    )
    mentor_profile: Mapped[Optional["MentorProfile"]] = relationship(
        "MentorProfile",
        back_populates="user",
        uselist=False,
        lazy="selectin"
    )
    guardian_profile: Mapped[Optional["GuardianProfile"]] = relationship(
        "GuardianProfile",
        back_populates="user",
        uselist=False,
        lazy="selectin"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
    sent_messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        foreign_keys="ChatMessage.sender_id",
        back_populates="sender",
        lazy="selectin"
    )
    reviews_given: Mapped[List["MentorReview"]] = relationship(
        "MentorReview",
        foreign_keys="MentorReview.athlete_id",
        back_populates="athlete",
        lazy="selectin"
    )
    reviews_received: Mapped[List["MentorReview"]] = relationship(
        "MentorReview",
        foreign_keys="MentorReview.mentor_id",
        back_populates="mentor",
        lazy="selectin"
    )
    mentorship_requests_as_athlete: Mapped[List["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        foreign_keys="MentorshipRequest.athlete_id",
        back_populates="athlete",
        lazy="selectin"
    )
    mentorship_requests_as_mentor: Mapped[List["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        foreign_keys="MentorshipRequest.mentor_id",
        back_populates="mentor",
        lazy="selectin"
    )
    mentorship_requests_as_guardian: Mapped[List["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        foreign_keys="MentorshipRequest.guardian_id",
        back_populates="guardian",
        lazy="selectin"
    )
    saved_scholarships: Mapped[List["SavedScholarship"]] = relationship(
        "SavedScholarship",
        foreign_keys="SavedScholarship.user_id",
        back_populates="athlete_user",
        lazy="selectin",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    @property
    def is_safety_officer(self) -> bool:
        return self.role == UserRole.SAFETY_OFFICER

    @property
    def is_mentor(self) -> bool:
        return self.role == UserRole.MENTOR

    @property
    def is_athlete(self) -> bool:
        return self.role == UserRole.ATHLETE

    def has_role(self, *roles: UserRole) -> bool:
        """Check if user has any of the specified roles"""
        return self.role in roles


# Import for type hints
from app.models.athlete import AthleteProfile
from app.models.mentor import MentorProfile
from app.models.guardian import GuardianProfile
from app.models.notification import Notification
from app.models.chat import ChatMessage
from app.models.review import MentorReview
from app.models.mentorship_request import MentorshipRequest
from app.models.scholarship import SavedScholarship