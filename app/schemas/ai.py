"""
AI Schemas
Request/response schemas for AI endpoints
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    """AI chat request schema"""
    question: str = Field(..., min_length=1, max_length=2000)
    athlete_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None


class AIChatResponse(BaseModel):
    """AI chat response schema"""
    answer: str
    source: str  # gemini, openai, groq, fallback
    confidence: float
    suggested_questions: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class AthleteSummaryRequest(BaseModel):
    """Athlete summary request schema"""
    athlete_id: str


class AthleteSummaryResponse(BaseModel):
    """Athlete summary response schema"""
    athlete_id: str
    summary: str
    strengths: List[str]
    areas_for_improvement: List[str]
    recommended_next_steps: List[str]
    profile_strength_score: float
    generated_at: str


class ScholarshipFitRequest(BaseModel):
    """Scholarship fit request schema"""
    athlete_id: str
    scholarship_id: str


class ScholarshipFitResponse(BaseModel):
    """Scholarship fit response schema"""
    athlete_id: str
    scholarship_id: str
    match_score: float  # 0-100
    reasoning: str
    suggested_actions: List[str]
    eligibility_gaps: Optional[List[str]] = None
    strengths_alignment: Optional[List[str]] = None
    deadline_reminder: Optional[str] = None


class MentorMatchRequest(BaseModel):
    """Mentor match request schema"""
    athlete_id: str
    mentor_ids: List[str] = Field(..., min_items=1, max_items=20)
    top_n: int = Field(default=5, ge=1, le=10)


class MentorMatchResponse(BaseModel):
    """Mentor match response schema"""
    athlete_id: str
    matches: List[Dict[str, Any]]
    total_mentors_evaluated: int
    source: str


class MentorMatchItem(BaseModel):
    """Single mentor match result"""
    mentor_id: str
    match_score: float
    explanation: str
    key_strengths: List[str]
    potential_challenges: Optional[List[str]] = None


class CollegeFitRequest(BaseModel):
    """College fit request schema"""
    athlete_id: str
    college_id: str


class CollegeFitResponse(BaseModel):
    """College fit response schema"""
    athlete_id: str
    college_id: str
    fit_score: float
    reasoning: str
    suggested_actions: List[str]
    sports_quota_alignment: Optional[str] = None
    academic_streams_match: Optional[List[str]] = None


class SafetyGuidanceRequest(BaseModel):
    """Safety guidance request schema"""
    report_id: Optional[str] = None
    safety_concern: Optional[str] = None
    category: Optional[str] = None


class SafetyGuidanceResponse(BaseModel):
    """Safety guidance response schema"""
    guidance: str
    immediate_actions: List[str]
    resources: List[str]
    escalation_threshold: Optional[str] = None
    disclaimer: str = "This AI-generated guidance is for informational purposes only. For emergencies, contact local authorities."


class MessageRiskRequest(BaseModel):
    """Message risk analysis request schema"""
    message_content: str = Field(..., min_length=1, max_length=5000)
    sender_id: str
    receiver_id: str
    context: Optional[Dict[str, Any]] = None


class MessageRiskResponse(BaseModel):
    """Message risk analysis response schema"""
    risk_score: float  # 0-100
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    flags: List[str]
    recommendations: List[str]
    should_flag: bool
    moderation_action: Optional[str] = None
    reasoning: Optional[str] = None


class TrainingRecommendationRequest(BaseModel):
    """Training recommendation request schema"""
    athlete_id: str
    focus_area: Optional[str] = None
    limit: int = Field(default=5, ge=1, le=20)


class TrainingRecommendationResponse(BaseModel):
    """Training recommendation response schema"""
    athlete_id: str
    recommendations: List[Dict[str, Any]]
    total_recommendations: int
    source: str
