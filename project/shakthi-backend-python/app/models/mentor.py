"""
Mentor Profile Model
Extended profile for mentors with verification and trust score
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Integer, Float, Text, DateTime, Boolean, Enum, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MentorProfile(Base):
    """Mentor profile with expertise and verification details"""
    __tablename__ = "mentor_profiles"

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
    expertise: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True, server_default="false")
    certifications: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    languages: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    trust_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, server_default="0.0")
    availability: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    training_philosophy: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    code_of_conduct_accepted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    response_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False, server_default="0")
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, server_default="0.0")
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
    user: Mapped["User"] = relationship("User", back_populates="mentor_profile", lazy="selectin")
    mentorship_requests: Mapped[List["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        primaryjoin="MentorProfile.user_id == MentorshipRequest.mentor_id",
        foreign_keys="[MentorshipRequest.mentor_id]",
        viewonly=True,
        lazy="selectin"
    )
    reviews: Mapped[List["MentorReview"]] = relationship(
        "MentorReview",
        primaryjoin="MentorProfile.user_id == MentorReview.mentor_id",
        foreign_keys="[MentorReview.mentor_id]",
        viewonly=True,
        lazy="selectin"
    )
    chat_threads: Mapped[List["ChatThread"]] = relationship(
        "ChatThread",
        primaryjoin="MentorProfile.user_id == ChatThread.mentor_id",
        foreign_keys="[ChatThread.mentor_id]",
        viewonly=True,
        lazy="selectin"
    )
    created_resources: Mapped[List["TrainingResource"]] = relationship(
        "TrainingResource",
        primaryjoin="MentorProfile.user_id == TrainingResource.created_by",
        foreign_keys="[TrainingResource.created_by]",
        viewonly=True,
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<MentorProfile {self.user_id} - {self.expertise}>"

    def update_rating(self, new_rating: float):
        """Update average rating with new review"""
        current_total = self.average_rating * self.total_reviews
        self.total_reviews += 1
        self.average_rating = (current_total + new_rating) / self.total_reviews


from sqlalchemy import ForeignKey
from typing import List
from app.models.user import User
from app.models.mentorship_request import MentorshipRequest
from app.models.review import MentorReview
from app.models.chat import ChatThread
from app.models.training_resource import TrainingResource
