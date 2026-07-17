"""
User Schemas
Request/response schemas for user endpoints
"""
from typing import Optional, List, Union
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime
from enum import Enum
from uuid import UUID

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone_number: Optional[str] = Field(default=None, min_length=10, max_length=20)


class UserCreate(UserBase):
    """User registration schema"""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = Field(default=UserRole.ATHLETE)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)


class UserResponse(BaseModel):
    """User response schema"""
    id: Union[str, UUID]
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: UserRole
    verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v


class UserMinimalResponse(BaseModel):
    """Minimal user info for nested responses"""
    id: Union[str, UUID]
    full_name: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    """Token refresh request"""
    refresh_token: str


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str
    exp: datetime
    iat: datetime
    role: UserRole
    type: str


class PasswordChange(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class EmailVerification(BaseModel):
    """Email verification request"""
    token: str
