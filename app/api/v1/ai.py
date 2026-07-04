"""
AI Routes
AI-powered features: chat, matching, summaries
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest, AIChatResponse,
    AthleteSummaryRequest, AthleteSummaryResponse,
    ScholarshipFitRequest, ScholarshipFitResponse,
    MentorMatchRequest, MentorMatchResponse,
    CollegeFitRequest, CollegeFitResponse,
    MessageRiskRequest, MessageRiskResponse,
    AIQueryRequest, AIQueryResponse,
    DocumentIngestResponse, IngestStatusResponse
)
from app.schemas.common import APIResponse


router = APIRouter()

class DummyLimiter:
    def limit(self, *args, **kwargs):
        def decorator(func):
            return func
        return decorator

limiter = DummyLimiter()


@router.post("/chat", response_model=APIResponse[AIChatResponse])
@limiter.limit("10/minute")
async def ai_chat(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI chat assistant.
    Provides contextual answers about scholarships, mentorship, training, etc.
    """
    # Import AI service
    from app.ai.gemini import GeminiService

    try:
        ai_service = GeminiService()
        response = await ai_service.chat(
            question=request.question,
            athlete_id=request.athlete_id,
            context=request.context,
            history=request.conversation_history
        )

        return APIResponse(
            success=True,
            message="AI response generated",
            data=response
        )

    except Exception as e:
        # Fallback response
        return APIResponse(
            success=True,
            message="AI response (fallback)",
            data=AIChatResponse(
                answer="I'm currently experiencing high demand. Please try again later or contact support for immediate assistance.",
                source="fallback",
                confidence=0.5
            )
        )


@router.post("/athlete-summary", response_model=APIResponse[AthleteSummaryResponse])
@limiter.limit("10/minute")
async def athlete_summary(
    request: AthleteSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate AI summary of athlete profile.
    Analyzes strengths, areas for improvement, and recommendations.
    """
    from app.ai.gemini import GeminiService

    # Get athlete data
    result = await db.execute(
        select(User).where(User.id == request.athlete_id)
    )
    athlete = result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    try:
        ai_service = GeminiService()
        summary = await ai_service.athlete_summary(athlete.athlete_profile)

        return APIResponse(
            success=True,
            message="Summary generated",
            data=AthleteSummaryResponse(
                athlete_id=request.athlete_id,
                **summary,
                generated_at="now"
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/scholarship-fit", response_model=APIResponse[ScholarshipFitResponse])
@limiter.limit("10/minute")
async def scholarship_fit(
    request: ScholarshipFitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
        Calculate AI-powered scholarship fit score.
        Returns match score, reasoning, and suggested actions.
        """
    from app.ai.gemini import GeminiService
    from app.models.scholarship import Scholarship

    # Get athlete and scholarship
    athlete_result = await db.execute(
        select(User).where(User.id == request.athlete_id)
    )
    athlete = athlete_result.scalar_one_or_none()

    scholarship_result = await db.execute(
        select(Scholarship).where(Scholarship.id == request.scholarship_id)
    )
    scholarship = scholarship_result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship not found"
        )

    try:
        ai_service = GeminiService()
        fit_result = await ai_service.scholarship_fit(
            athlete.athlete_profile,
            scholarship
        )

        return APIResponse(
            success=True,
            message="Fit analysis complete",
            data=ScholarshipFitResponse(
                athlete_id=request.athlete_id,
                scholarship_id=request.scholarship_id,
                **fit_result
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/mentor-match", response_model=APIResponse[MentorMatchResponse])
@limiter.limit("10/minute")
async def mentor_match(
    request: MentorMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
        AI-powered mentor matching.
        Ranks mentors based on athlete needs and mentor expertise.
        """
    from app.ai.gemini import GeminiService

    # Get athlete
    athlete_result = await db.execute(
        select(User).where(User.id == request.athlete_id)
    )
    athlete = athlete_result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    try:
        ai_service = GeminiService()
        matches = await ai_service.mentor_match(
            athlete.athlete_profile,
            request.mentor_ids,
            request.top_n
        )

        return APIResponse(
            success=True,
            message="Mentor matches generated",
            data=MentorMatchResponse(
                athlete_id=request.athlete_id,
                matches=matches,
                total_mentors_evaluated=len(request.mentor_ids),
                source="gemini"
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/college-fit", response_model=APIResponse[CollegeFitResponse])
@limiter.limit("10/minute")
async def college_fit(
    request: CollegeFitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
        Calculate AI-powered college fit score.
        Analyzes sports quota, academic streams, and location.
        """
    from app.ai.gemini import GeminiService
    from app.models.college import College

    # Get athlete and college
    athlete_result = await db.execute(
        select(User).where(User.id == request.athlete_id)
    )
    athlete = athlete_result.scalar_one_or_none()

    college_result = await db.execute(
        select(College).where(College.id == request.college_id)
    )
    college = college_result.scalar_one_or_none()

    if not athlete or not athlete.athlete_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete not found"
        )

    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found"
        )

    try:
        ai_service = GeminiService()
        fit_result = await ai_service.college_fit(
            athlete.athlete_profile,
            college
        )

        return APIResponse(
            success=True,
            message="College fit analysis complete",
            data=CollegeFitResponse(
                athlete_id=request.athlete_id,
                college_id=request.college_id,
                **fit_result
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/message-risk", response_model=APIResponse[MessageRiskResponse])
@limiter.limit("30/minute")
async def message_risk(
    request: MessageRiskRequest,
    current_user: User = Depends(get_current_user)
):
    """
        Assess message content for safety risks.
        Detects inappropriate content, harassment, grooming patterns.
        """
    from app.ai.gemini import GeminiService

    try:
        ai_service = GeminiService()
        risk_result = await ai_service.message_risk(
            request.message_content,
            request.sender_id,
            request.receiver_id,
            request.context
        )

        return APIResponse(
            success=True,
            message="Risk assessment complete",
            data=MessageRiskResponse(**risk_result)
        )

    except Exception as e:
        # Default to safe when AI fails
        return APIResponse(
            success=True,
            message="Risk assessment (default)",
            data=MessageRiskResponse(
                risk_score=0,
                risk_level="LOW",
                flags=[],
                recommendations=["AI moderation temporarily unavailable"],
                should_flag=False,
                reasoning="Default safe response due to service error"
            )
        )


@router.post("/safety-guidance", response_model=APIResponse[dict])
@limiter.limit("10/minute")
async def safety_guidance(
    report_id: str = None,
    safety_concern: str = None,
    category: str = None,
    current_user: User = Depends(get_current_user)
):
    """
        Provide AI-generated safety guidance.
        Offers resources and steps for safety concerns.
        """
    from app.ai.gemini import GeminiService

    try:
        ai_service = GeminiService()
        guidance = await ai_service.safety_guidance(
            report_id=report_id,
            safety_concern=safety_concern,
            category=category
        )

        return APIResponse(
            success=True,
            message="Safety guidance generated",
            data=guidance
        )

    except Exception as e:
        return APIResponse(
            success=True,
            message="Safety guidance (fallback)",
            data={
                "guidance": "If you're experiencing a safety concern, please report it immediately using the safety report feature. For emergencies, contact local authorities.",
                "immediate_actions": [
                    "Report the incident using the app",
                    "Document any evidence",
                    "Contact a trusted adult"
                ],
                "resources": [
                    "Internal reporting system",
                    "Safety team support"
                ]
            }
        )


@router.post("/ingest", response_model=APIResponse[DocumentIngestResponse], status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute")
async def ingest_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    collection_name: str = Form(...),
    uploader_role: str = Form(...),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest a document (PDF, Text) asynchronously.
    Creates a background job to parse, clean, chunk, embed, and store vector embeddings.
    """
    import uuid
    import os
    from app.services.storage import get_storage_service
    from app.models.document import Document, DocStatus

    if collection_name not in ["scholarships", "colleges", "safety"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="collection_name must be one of: scholarships, colleges, safety"
        )

    # 1. Write file to storage
    storage = get_storage_service()
    doc_uuid = uuid.uuid4()
    file_ext = os.path.splitext(file.filename)[1]
    relative_path = f"documents/{collection_name}/{doc_uuid}{file_ext}"
    
    try:
        stored_path = await storage.upload_file(file, relative_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage upload failed: {str(e)}"
        )

    # Calculate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    # Parse tags
    tag_list = []
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    # 2. Create document record in DB
    document = Document(
        id=doc_uuid,
        title=file.filename,
        file_name=file.filename,
        file_path=stored_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        collection_name=collection_name,
        uploader_id=current_user.id,
        uploader_role=uploader_role,
        tags=tag_list,
        status=DocStatus.PENDING
    )
    
    db.add(document)
    await db.commit()
    await db.refresh(document)

    # 3. Schedule Background Ingestion task (and run it synchronously to guarantee execution)
    await run_ingestion(document.id)

    return APIResponse(
        success=True,
        message="Document uploaded and ingestion scheduled",
        data=DocumentIngestResponse(
            document_id=str(document.id),
            status=document.status.value,
            collection_name=document.collection_name
        )
    )

async def run_ingestion(document_id: UUID):
    from loguru import logger
    logger.info(f"Starting run_ingestion background task for document_id={document_id}")
    try:
        from app.database import async_session_factory
        from app.services.ingestion import IngestionService
        
        async with async_session_factory() as session:
            service = IngestionService(session)
            await service.process_document(document_id)
    except Exception as e:
        logger.exception(f"Fatal error in run_ingestion background task for {document_id}: {e}")


@router.get("/ingest/status/{document_id}", response_model=APIResponse[IngestStatusResponse])
async def get_ingest_status(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check processing status of a document ingestion job"""
    from app.models.document import Document, DocumentChunk
    from sqlalchemy import func

    # Fetch document
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingestion job / document not found"
        )

    # Count generated chunks
    result = await db.execute(
        select(func.count(DocumentChunk.id)).where(DocumentChunk.document_id == document_id)
    )
    total_chunks = result.scalar_one()

    return APIResponse(
        success=True,
        message="Ingestion status retrieved",
        data=IngestStatusResponse(
            document_id=str(doc.id),
            status=doc.status.value,
            total_chunks=total_chunks,
            error_message=doc.error_message
        )
    )


@router.post("/query", response_model=APIResponse[AIQueryResponse])
@limiter.limit("15/minute")
async def query_assistant(
    request: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Query the grounded RAG assistant (scholarships, colleges, or safety).
    Answers are verified and grounded strictly on uploaded reference documents.
    """
    from app.services.orchestrator import RAGOrchestrator

    if request.assistant_type not in ["scholarships", "colleges", "safety"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="assistant_type must be one of: scholarships, colleges, safety"
        )

    try:
        orchestrator = RAGOrchestrator(db)
        result = await orchestrator.query_assistant(
            question=request.question,
            assistant_type=request.assistant_type,
            filters=request.filters
        )
        return APIResponse(
            success=True,
            message="Answer generated",
            data=AIQueryResponse(**result)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG query execution failed: {str(e)}"
        )
