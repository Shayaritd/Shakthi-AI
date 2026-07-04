"""
Pydantic Schemas Package
Request/response schemas for all API endpoints
"""
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate,
    Token, TokenRefresh, TokenPayload
)
from app.schemas.athlete import (
    AthleteProfileCreate, AthleteProfileUpdate, AthleteProfileResponse,
    AthleteDashboard
)
from app.schemas.mentor import (
    MentorProfileCreate, MentorProfileUpdate, MentorProfileResponse,
    MentorFilter, MentorDashboard
)
from app.schemas.scholarship import (
    ScholarshipCreate, ScholarshipUpdate, ScholarshipResponse,
    ScholarshipFilter, SavedScholarshipResponse
)
from app.schemas.safety import (
    SafetyReportCreate, SafetyReportUpdate, SafetyReportResponse,
    ReportTimelineResponse
)
from app.schemas.ai import (
    AIChatRequest, AIChatResponse,
    AthleteSummaryRequest, AthleteSummaryResponse,
    ScholarshipFitRequest, ScholarshipFitResponse,
    MentorMatchRequest, MentorMatchResponse,
    CollegeFitRequest, CollegeFitResponse,
    MessageRiskRequest, MessageRiskResponse,
    AICitation, AIQueryRequest, AIQueryResponse,
    DocumentIngestResponse, IngestStatusResponse
)
from app.schemas.common import (
    PaginationParams, PaginatedResponse, APIResponse,
    ErrorResponse, HealthResponse
)

__all__ = [
    # User
    "UserCreate", "UserLogin", "UserResponse", "UserUpdate",
    "Token", "TokenRefresh", "TokenPayload",
    # Athlete
    "AthleteProfileCreate", "AthleteProfileUpdate", "AthleteProfileResponse",
    "AthleteDashboard",
    # Mentor
    "MentorProfileCreate", "MentorProfileUpdate", "MentorProfileResponse",
    "MentorFilter", "MentorDashboard",
    # Scholarship
    "ScholarshipCreate", "ScholarshipUpdate", "ScholarshipResponse",
    "ScholarshipFilter", "SavedScholarshipResponse",
    # Safety
    "SafetyReportCreate", "SafetyReportUpdate", "SafetyReportResponse",
    "ReportTimelineResponse",
    # AI
    "AIChatRequest", "AIChatResponse",
    "AthleteSummaryRequest", "AthleteSummaryResponse",
    "ScholarshipFitRequest", "ScholarshipFitResponse",
    "MentorMatchRequest", "MentorMatchResponse",
    "CollegeFitRequest", "CollegeFitResponse",
    "MessageRiskRequest", "MessageRiskResponse",
    "AICitation", "AIQueryRequest", "AIQueryResponse",
    "DocumentIngestResponse", "IngestStatusResponse",
    # Common
    "PaginationParams", "PaginatedResponse", "APIResponse",
    "ErrorResponse", "HealthResponse",
]
