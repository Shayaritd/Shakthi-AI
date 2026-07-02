"""
Admin Routes
Admin dashboard and management
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User, UserRole
from app.models.safety_report import SafetyReport, ReportStatus
from app.models.mentor import MentorProfile
from app.schemas.user import UserResponse
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/dashboard", response_model=APIResponse[dict])
async def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard stats"""
    # User stats
    users_query = select(
        UserRole,
        func.count(User.id).label("count")
    ).group_by(UserRole)

    users_result = await db.execute(users_query)
    users_by_role = {row[0].value: row[1] for row in users_result.all()}

    # Total users
    total_users = await db.execute(select(func.count(User.id)))
    total = total_users.scalar() or 0

    # Verified users
    verified_users = await db.execute(
        select(func.count(User.id)).where(User.verified == True)
    )
    verified = verified_users.scalar() or 0

    # Pending mentor verifications
    pending_mentors = await db.execute(
        select(func.count(MentorProfile.id)).where(MentorProfile.verified == False)
    )
    pending_verifications = pending_mentors.scalar() or 0

    # Safety reports stats
    reports_query = select(
        ReportStatus,
        func.count(SafetyReport.id).label("count")
    ).group_by(ReportStatus)

    reports_result = await db.execute(reports_query)
    reports_by_status = {row[0].value: row[1] for row in reports_result.all()}

    # Urgent reports
    urgent_reports = await db.execute(
        select(func.count(SafetyReport.id)).where(
            SafetyReport.status.in_([ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW]),
            SafetyReport.severity == "URGENT"
        )
    )
    urgent = urgent_reports.scalar() or 0

    dashboard = {
        "users": {
            "total": total,
            "verified": verified,
            "by_role": users_by_role
        },
        "mentors": {
            "pending_verifications": pending_verifications
        },
        "safety_reports": {
            "by_status": reports_by_status,
            "urgent_unresolved": urgent
        },
        "timestamps": {
            "generated_at": datetime.utcnow().isoformat()
        }
    }

    return APIResponse(
        success=True,
        message="Dashboard data retrieved",
        data=dashboard
    )


@router.get("/users", response_model=APIResponse[List[UserResponse]])
async def list_users(
    role: Optional[UserRole] = Query(None),
    verified: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all users with filters"""
    query = select(User)

    if role:
        query = query.where(User.role == role)

    if verified is not None:
        query = query.where(User.verified == verified)

    if search:
        query = query.where(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(User.created_at.desc())

    result = await db.execute(query)
    users = result.scalars().all()

    return APIResponse(
        success=True,
        message="Users retrieved",
        data=[UserResponse.model_validate(u) for u in users],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.put("/users/{user_id}/suspend", response_model=APIResponse[UserResponse])
async def suspend_user(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Suspend a user"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend yourself"
        )

    user.is_active = False
    await db.commit()
    await db.refresh(user)

    return APIResponse(
        success=True,
        message="User suspended",
        data=UserResponse.model_validate(user)
    )


@router.put("/users/{user_id}/activate", response_model=APIResponse[UserResponse])
async def activate_user(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Activate a suspended user"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = True
    await db.commit()
    await db.refresh(user)

    return APIResponse(
        success=True,
        message="User activated",
        data=UserResponse.model_validate(user)
    )


@router.get("/mentors/verification", response_model=APIResponse[List[dict]])
async def get_pending_verifications(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get pending mentor verifications"""
    query = select(User).join(MentorProfile).where(
        MentorProfile.verified == False
    )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size)

    result = await db.execute(query)
    mentors = result.scalars().all()

    mentor_list = [
        {
            "id": str(m.id),
            "name": m.full_name,
            "email": m.email,
            "expertise": m.mentor_profile.expertise if m.mentor_profile else None,
            "experience_years": m.mentor_profile.experience_years if m.mentor_profile else None,
            "created_at": m.created_at.isoformat()
        }
        for m in mentors
    ]

    return APIResponse(
        success=True,
        message="Pending verifications retrieved",
        data=mentor_list,
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.put("/mentors/{mentor_id}/verify", response_model=APIResponse[dict])
async def verify_mentor(
    mentor_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Verify a mentor"""
    result = await db.execute(
        select(MentorProfile).where(MentorProfile.user_id == mentor_id)
    )
    mentor_profile = result.scalar_one_or_none()

    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found"
        )

    mentor_profile.verified = True

    # Also verify user
    user_result = await db.execute(
        select(User).where(User.id == mentor_id)
    )
    user = user_result.scalar_one_or_none()
    if user:
        user.verified = True

    await db.commit()

    return APIResponse(
        success=True,
        message="Mentor verified"
    )
