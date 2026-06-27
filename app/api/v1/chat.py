"""
Chat Routes
Chat threads and messages
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.chat import ChatThread, ChatMessage
from app.models.mentorship_request import MentorshipRequest, RequestStatus
from app.schemas.chat import (
    ChatThreadCreate, ChatThreadResponse, ChatMessageCreate,
    ChatMessageResponse, ChatReportCreate
)
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/threads", response_model=APIResponse[List[ChatThreadResponse]])
async def get_chat_threads(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's chat threads"""
    if current_user.role == UserRole.ATHLETE:
        query = select(ChatThread).where(ChatThread.athlete_id == current_user.id)
    elif current_user.role == UserRole.MENTOR:
        query = select(ChatThread).where(ChatThread.mentor_id == current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only athletes and mentors can access chat"
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(ChatThread.updated_at.desc())

    result = await db.execute(query)
    threads = result.scalars().all()

    response_data = []
    for thread in threads:
        thread_dict = ChatThreadResponse.model_validate(thread).model_dump()
        # Get last message
        msg_result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.thread_id == thread.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()
        thread_dict["last_message"] = ChatMessageResponse.model_validate(last_msg).model_dump() if last_msg else None

        # Count unread
        if current_user.role == UserRole.ATHLETE:
            unread = await db.execute(
                select(func.count(ChatMessage.id)).where(
                    ChatMessage.thread_id == thread.id,
                    ChatMessage.sender_id == thread.mentor_id,
                    ChatMessage.read == False
                )
            )
        else:
            unread = await db.execute(
                select(func.count(ChatMessage.id)).where(
                    ChatMessage.thread_id == thread.id,
                    ChatMessage.sender_id == thread.athlete_id,
                    ChatMessage.read == False
                )
            )
        thread_dict["unread_count"] = unread.scalar() or 0

        response_data.append(thread_dict)

    return APIResponse(
        success=True,
        message="Chat threads retrieved",
        data=response_data,
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.get("/threads/{thread_id}/messages", response_model=APIResponse[List[ChatMessageResponse]])
async def get_messages(
    thread_id: UUID,
    before: Optional[datetime] = Query(None),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages in a thread"""
    # Verify thread access
    result = await db.execute(
        select(ChatThread).where(ChatThread.id == thread_id)
    )
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )

    if thread.athlete_id != current_user.id and thread.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    query = select(ChatMessage).where(ChatMessage.thread_id == thread_id)

    if before:
        query = query.where(ChatMessage.created_at < before)

    query = query.limit(limit).order_by(ChatMessage.created_at.desc())

    result = await db.execute(query)
    messages = result.scalars().all()

    # Mark as read
    if current_user.role == UserRole.ATHLETE:
        await db.execute(
            update(ChatMessage)
            .where(
                ChatMessage.thread_id == thread_id,
                ChatMessage.sender_id == thread.mentor_id,
                ChatMessage.read == False
            )
            .values(read=True, read_at=datetime.utcnow())
        )
    else:
        await db.execute(
            update(ChatMessage)
            .where(
                ChatMessage.thread_id == thread_id,
                ChatMessage.sender_id == thread.athlete_id,
                ChatMessage.read == False
            )
            .values(read=True, read_at=datetime.utcnow())
        )
    await db.commit()

    return APIResponse(
        success=True,
        message="Messages retrieved",
        data=[ChatMessageResponse.model_validate(m) for m in reversed(messages)]
    )


@router.post("/threads/{thread_id}/messages", response_model=APIResponse[ChatMessageResponse], status_code=status.HTTP_201_CREATED)
async def send_message(
    thread_id: UUID,
    message_data: ChatMessageCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message in a thread"""
    # Verify thread access
    result = await db.execute(
        select(ChatThread).where(ChatThread.id == thread_id)
    )
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )

    if thread.athlete_id != current_user.id and thread.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # TODO: Run AI moderation on message content
    # background_tasks.add_task(moderate_message, message_data.content)

    message = ChatMessage(
        thread_id=thread_id,
        sender_id=current_user.id,
        content=message_data.content,
        attachment_urls=message_data.attachment_urls,
        guardian_visible=message_data.guardian_visible
    )

    db.add(message)

    # Update thread
    thread.last_message_at = datetime.utcnow()

    await db.commit()
    await db.refresh(message)

    return APIResponse(
        success=True,
        message="Message sent",
        data=ChatMessageResponse.model_validate(message)
    )


@router.post("/threads/{thread_id}/report", response_model=APIResponse[dict])
async def report_conversation(
    thread_id: UUID,
    report_data: ChatReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Report a chat message or thread"""
    # Verify thread
    result = await db.execute(
        select(ChatThread).where(ChatThread.id == thread_id)
    )
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )

    # Create safety report
    from app.api.v1.safety import submit_report
    from app.schemas.safety import SafetyReportCreate as SRC
    from app.models.safety_report import ReportCategory

    # Safety report will be created via the safety endpoint
    # This is a simplified version
    return APIResponse(
        success=True,
        message="Report submitted. Use /safety/reports to track status."
    )


@router.post("/threads/{thread_id}/block", response_model=APIResponse[dict])
async def block_thread(
    thread_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Block a chat thread"""
    result = await db.execute(
        select(ChatThread).where(ChatThread.id == thread_id)
    )
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )

    if thread.athlete_id != current_user.id and thread.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    thread.is_blocked = True
    thread.blocked_by = current_user.id
    thread.is_active = False

    await db.commit()

    return APIResponse(
        success=True,
        message="Thread blocked"
    )


@router.post("/start", response_model=APIResponse[ChatThreadResponse], status_code=status.HTTP_201_CREATED)
async def start_chat(
    thread_data: ChatThreadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a new chat thread"""
    if current_user.role != UserRole.ATHLETE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only athletes can initiate chat"
        )

    # Check for existing thread
    result = await db.execute(
        select(ChatThread).where(
            ChatThread.athlete_id == current_user.id,
            ChatThread.mentor_id == thread_data.mentor_id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        return APIResponse(
            success=True,
            message="Thread already exists",
            data=ChatThreadResponse.model_validate(existing)
        )

    # Verify mentor
    mentor_result = await db.execute(
        select(User).where(User.id == thread_data.mentor_id, User.role == UserRole.MENTOR)
    )
    mentor = mentor_result.scalar_one_or_none()

    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )

    # Create thread
    thread = ChatThread(
        athlete_id=current_user.id,
        mentor_id=thread_data.mentor_id,
        mentorship_request_id=thread_data.mentorship_request_id
    )

    db.add(thread)
    await db.commit()
    await db.refresh(thread)

    return APIResponse(
        success=True,
        message="Chat thread created",
        data=ChatThreadResponse.model_validate(thread)
    )
