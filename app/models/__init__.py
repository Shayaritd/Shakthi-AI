"""
SQLAlchemy Models Package
All database models for SHAKTHI platform
"""
from app.models.user import User, UserRole
from app.models.athlete import AthleteProfile, AchievementLevel
from app.models.mentor import MentorProfile
from app.models.guardian import GuardianProfile, GuardianRelation
from app.models.scholarship import Scholarship, SavedScholarship, SavedStatus
from app.models.mentorship_request import MentorshipRequest, RequestStatus, MentorshipMode
from app.models.safety_report import SafetyReport, ReportCategory, ReportSeverity, ReportStatus
from app.models.college import College
from app.models.opportunity import Opportunity, OpportunityType
from app.models.training_resource import TrainingResource, TrainingCategory
from app.models.sponsor import SponsorProgram, SponsorType, SponsorStatus
from app.models.review import MentorReview
from app.models.notification import Notification, NotificationType
from app.models.chat import ChatThread, ChatMessage
from app.models.document import Document, DocumentChunk, DocStatus

__all__ = [
    "User", "UserRole",
    "AthleteProfile", "AchievementLevel",
    "MentorProfile",
    "GuardianProfile", "GuardianRelation",
    "Scholarship", "SavedScholarship", "SavedStatus",
    "MentorshipRequest", "RequestStatus", "MentorshipMode",
    "SafetyReport", "ReportCategory", "ReportSeverity", "ReportStatus",
    "College",
    "Opportunity", "OpportunityType",
    "TrainingResource", "TrainingCategory",
    "SponsorProgram", "SponsorType", "SponsorStatus",
    "MentorReview",
    "Notification", "NotificationType",
    "ChatThread", "ChatMessage",
    "Document", "DocumentChunk", "DocStatus"
]
