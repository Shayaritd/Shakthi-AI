"""
Notification Model
User notifications
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Boolean, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class NotificationType(str, enum.Enum):
    """Types of notifications"""
    MENTORSHIP = "MENTORSHIP"
    SCHOLARSHIP = "SCHOLARSHIP"
    REPORT = "REPORT"
    VERIFICATION = "VERIFICATION"
    REWARD = "REWARD"
    ADMIN = "ADMIN"
    SYSTEM = "SYSTEM"
    CHAT = "CHAT"
    OPPORTUNITY = "OPPORTUNITY"
    TRAINING = "TRAINING"
    REMINDER = "REMINDER"


class Notification(Base):
    """User notification"""
    __tablename__ = "notifications"

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
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    action_text: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    meta: Mapped[Optional[dict]] = mapped_column("extra_data", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Notification {self.user_id}: {self.title}>"


from sqlalchemy.dialects.postgresql import JSON
from app.models.user import User
