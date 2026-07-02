"""
Mentor Review Model
Reviews and ratings for mentors
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Boolean, Integer, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MentorReview(Base):
    """Review for a mentor by athlete"""
    __tablename__ = "mentor_reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    mentor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    athlete_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    mentorship_request_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mentorship_requests.id", ondelete="SET NULL"),
        nullable=True
    )
    respectful: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    helpful: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    knowledgeable: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    safe_communication: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    punctual: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    overall_rating: Mapped[float] = mapped_column(nullable=False)  # Calculated average
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    private_safety_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    safety_concern: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    moderated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
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
    mentor: Mapped["User"] = relationship(
        "User",
        foreign_keys=[mentor_id],
        back_populates="reviews_received",
        lazy="selectin"
    )
    athlete: Mapped["User"] = relationship(
        "User",
        foreign_keys=[athlete_id],
        back_populates="reviews_given",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<MentorReview {self.athlete_id} -> {self.mentor_id}: {self.overall_rating}>"

    def calculate_overall(self) -> float:
        """Calculate overall rating from individual scores"""
        scores = [self.respectful, self.helpful, self.knowledgeable,
                  self.safe_communication, self.punctual]
        return round(sum(scores) / len(scores), 2)


from app.models.user import User
