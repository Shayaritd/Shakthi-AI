"""
Guardian Profile Model
Guardian/Parent profile for athlete oversight
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class GuardianRelation(str, enum.Enum):
    """Guardian relationship to athlete"""
    FATHER = "FATHER"
    MOTHER = "MOTHER"
    BROTHER = "BROTHER"
    SISTER = "SISTER"
    UNCLE = "UNCLE"
    AUNT = "AUNT"
    GRANDFATHER = "GRANDFATHER"
    GRANDMOTHER = "GRANDMOTHER"
    GUARDIAN = "GUARDIAN"
    OTHER = "OTHER"


class GuardianProfile(Base):
    """Guardian profile for parental oversight"""
    __tablename__ = "guardian_profiles"

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
    relation: Mapped[GuardianRelation] = mapped_column(
        Enum(GuardianRelation),
        nullable=False
    )
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    verified: Mapped[bool] = mapped_column(default=False, nullable=False)
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
    user: Mapped["User"] = relationship("User", back_populates="guardian_profile", lazy="selectin")
    mentored_athletes: Mapped[List["MentorshipRequest"]] = relationship(
        "MentorshipRequest",
        foreign_keys="MentorshipRequest.guardian_id",
        back_populates="guardian",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<GuardianProfile {self.user_id} - {self.relation}>"


from sqlalchemy import ForeignKey
from app.models.user import User
from app.models.mentorship_request import MentorshipRequest
