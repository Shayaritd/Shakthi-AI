"""
Common Schemas
Shared schemas for pagination, responses, etc.
"""
from typing import Generic, TypeVar, Optional, List, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Pagination query parameters"""
    page: int = Field(default=1, ge=1, description="Page number")
    size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PaginationMeta(BaseModel):
    """Pagination metadata for responses"""
    page: int
    size: int
    total: int
    pages: int


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool = True
    data: Optional[T] = None
    message: str = "Operation successful"
    pagination: Optional[PaginationMeta] = None
    errors: Optional[List[Dict[str, str]]] = None


class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = False
    data: Optional[Any] = None
    message: str
    errors: Optional[List[Dict[str, str]]] = None
    error_code: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    version: str
    environment: str
    database: str = "connected"
    redis: str = "connected"
    timestamp: datetime


class MessageResponse(BaseModel):
    """Simple message response"""
    success: bool = True
    message: str


class IDResponse(BaseModel):
    """Response with just an ID"""
    id: str
    success: bool = True


class PaginatedResponse(APIResponse[List[Any]]):
    """Generic paginated response wrapper"""
    pass
