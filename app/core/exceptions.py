"""
Custom Exceptions
Application-specific exception classes
"""
from typing import Optional, List, Dict, Any


class SHAKTHIException(Exception):
    """Base exception for SHAKTHI application"""

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[List[Dict[str, Any]]] = None
    ):
        self.message = message
        self.error_code = error_code or "UNKNOWN_ERROR"
        self.details = details or []
        super().__init__(self.message)


class NotFoundException(SHAKTHIException):
    """Resource not found"""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} with id '{identifier}' not found",
            error_code="NOT_FOUND",
            details=[{"resource": resource, "identifier": identifier}]
        )


class AlreadyExistsException(SHAKTHIException):
    """Resource already exists"""

    def __init__(self, resource: str, field: str, value: str):
        super().__init__(
            message=f"{resource} with {field} '{value}' already exists",
            error_code="ALREADY_EXISTS",
            details=[{"resource": resource, "field": field, "value": value}]
        )


class UnauthorizedException(SHAKTHIException):
    """Unauthorized access"""

    def __init__(self, message: str = "Unauthorized access"):
        super().__init__(message=message, error_code="UNAUTHORIZED")


class ForbiddenException(SHAKTHIException):
    """Forbidden action"""

    def __init__(self, message: str = "Action forbidden"):
        super().__init__(message=message, error_code="FORBIDDEN")


class ValidationException(SHAKTHIException):
    """Validation error"""

    def __init__(self, message: str, details: List[Dict[str, Any]]):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details=details
        )


class RateLimitException(SHAKTHIException):
    """Rate limit exceeded"""

    def __init__(self, retry_after: int = 60):
        super().__init__(
            message=f"Rate limit exceeded. Retry after {retry_after} seconds",
            error_code="RATE_LIMIT_EXCEEDED",
            details=[{"retry_after": retry_after}]
        )


class AIException(SHAKTHIException):
    """AI service error"""

    def __init__(self, message: str, provider: str = "unknown"):
        super().__init__(
            message=message,
            error_code="AI_SERVICE_ERROR",
            details=[{"provider": provider}]
        )


class ExternalServiceException(SHAKTHIException):
    """External service error"""

    def __init__(self, service: str, message: str):
        super().__init__(
            message=f"{service} service error: {message}",
            error_code="EXTERNAL_SERVICE_ERROR",
            details=[{"service": service}]
        )


class DatabaseException(SHAKTHIException):
    """Database error"""

    def __init__(self, message: str = "Database error"):
        super().__init__(message=message, error_code="DATABASE_ERROR")
