"""
User Schemas
Pydantic models for user-related operations
"""
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_serializer

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=15)
    role: UserRole = UserRole.ATHLETE


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=15)


class TokenPayload(BaseModel):
    """Token payload schema"""
    sub: str  # User ID
    role: UserRole
    exp: Optional[int] = None
    iat: Optional[int] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)

    @field_serializer("created_at", "updated_at")
    def serialize_datetime(self, dt: datetime) -> str:
        return dt.isoformat()

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Token refresh request"""
    refresh_token: str