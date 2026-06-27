"""
API v1 Router
Includes all API version 1 routes
"""
from fastapi import APIRouter

from app.api.v1 import (
    auth,
    athletes,
    mentors,
    scholarships,
    safety,
    colleges,
    opportunities,
    training,
    sponsors,
    reviews,
    notifications,
    admin,
    ai,
    chat,
)


api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(athletes.router, prefix="/athletes", tags=["Athletes"])
api_router.include_router(mentors.router, prefix="/mentors", tags=["Mentors"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["Scholarships"])
api_router.include_router(safety.router, prefix="/safety", tags=["Safety"])
api_router.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["Opportunities"])
api_router.include_router(training.router, prefix="/training", tags=["Training"])
api_router.include_router(sponsors.router, prefix="/sponsors", tags=["Sponsors"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
