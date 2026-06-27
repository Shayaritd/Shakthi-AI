"""
Chat Models
Chat threads and messages for mentorship communication
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ChatThread(Base):
    """Chat thread between athlete and mentor"""
    __tablename__ = "chat_threads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    athlete_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    mentor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    mentorship_request_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mentorship_requests.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    blocked_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    last_message_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
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
    athlete: Mapped["User"] = relationship(
        "User",
        foreign_keys=[athlete_id],
        lazy="selectin"
    )
    mentor: Mapped["User"] = relationship(
        "User",
        foreign_keys=[mentor_id],
        lazy="selectin"
    )
    mentorship_request: Mapped[Optional["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        back_populates="chat_thread",
        lazy="selectin"
    )
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="thread",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )

    def __repr__(self) -> str:
        return f"<ChatThread {self.athlete_id} <-> {self.mentor_id}>"


class ChatMessage(Base):
    """Individual chat message"""
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    thread_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_threads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    attachment_urls: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    moderation_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    moderation_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    moderated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    guardian_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_system_message: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    thread: Mapped["ChatThread"] = relationship("ChatThread", back_populates="messages", lazy="selectin")
    sender: Mapped["User"] = relationship("User", back_populates="sent_messages", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ChatMessage {self.thread_id}: {self.sender_id}>"

    @property
    def is_from_mentor(self) -> bool:
        return self.sender_id == self.thread.mentor_id if self.thread else False


from app.models.user import User
from app.models.mentorship_request import MentorshipRequest
