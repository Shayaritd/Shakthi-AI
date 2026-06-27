"""
Common Schemas
Shared Pydantic models for API responses
"""
from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, Field

T = TypeVar('T')


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)

    class Config:
        from_attributes = True


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int
    size: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    items: List[T]
    meta: PaginationMeta

    class Config:
        from_attributes = True


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    errors: Optional[List[dict]] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Simple message response"""
    message: str
    success: bool = True

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    status_code: int
    errors: Optional[List[dict]] = None

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "ok"
    version: str = "1.0.0"
    environment: str = "development"

    class Config:
        from_attributes = True