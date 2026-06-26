"""
Training Resource Model
Educational content for athletes
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class TrainingCategory(str, enum.Enum):
    """Categories of training resources"""
    SKILLS_DRILLS = "SKILLS_DRILLS"
    TECHNIQUE = "TECHNIQUE"
    NUTRITION = "NUTRITION"
    INJURY_PREVENTION = "INJURY_PREVENTION"
    MENTAL_WELLNESS = "MENTAL_WELLNESS"
    MENSTRUAL_HEALTH = "MENSTRUAL_HEALTH"
    TIME_MANAGEMENT = "TIME_MANAGEMENT"
    CAREER_PLANNING = "CAREER_PLANNING"
    TRIAL_PREP = "TRIAL_PREP"
    SCHOLARSHIP_GUIDANCE = "SCHOLARSHIP_GUIDANCE"
    STRENGTH_CONDITIONING = "STRENGTH_CONDITIONING"
    RECOVERY = "RECOVERY"


class TrainingResource(Base):
    """Training and educational content"""
    __tablename__ = "training_resources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[TrainingCategory] = mapped_column(
        Enum(TrainingCategory),
        nullable=False,
        index=True
    )
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sport: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    difficulty_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    tags: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    view_count: Mapped[int] = mapped_column(default=0, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    is_published: Mapped[bool] = mapped_column(default=True, nullable=False)
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
    author_user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<TrainingResource {self.title} ({self.category})>"


from app.models.user import User
