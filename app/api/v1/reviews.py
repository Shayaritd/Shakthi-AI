"""
Review Routes
Mentor reviews and ratings
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user, require_athlete, require_admin
from app.models.user import User
from app.models.review import MentorReview
from app.models.mentorship_request import MentorshipRequest, RequestStatus
from app.schemas.review import (
    MentorReviewCreate, MentorReviewUpdate, MentorReviewResponse, MentorReviewFilter
)
from app.schemas.common import APIResponse, PaginationMeta


router = APIRouter()


@router.get("/mentor/{mentor_id}", response_model=APIResponse[List[MentorReviewResponse]])
async def get_mentor_reviews(
    mentor_id: UUID,
    min_rating: Optional[float] = Query(None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get reviews for a mentor"""
    query = select(MentorReview).where(
        MentorReview.mentor_id == mentor_id,
        MentorReview.visible == True
    ).options(selectinload(MentorReview.athlete))

    if min_rating:
        query = query.where(MentorReview.overall_rating >= min_rating)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(MentorReview.created_at.desc())

    result = await db.execute(query)
    reviews = result.scalars().all()

    return APIResponse(
        success=True,
        message="Reviews retrieved",
        data=[MentorReviewResponse.model_validate(r) for r in reviews],
        pagination=PaginationMeta(
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size
        )
    )


@router.post("/", response_model=APIResponse[MentorReviewResponse], status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: MentorReviewCreate,
    current_user: User = Depends(require_athlete),
    db: AsyncSession = Depends(get_db)
):
    """Create a review for a mentor"""
    # Verify no existing review
    result = await db.execute(
        select(MentorReview).where(
            MentorReview.mentor_id == review_data.mentor_id,
            MentorReview.athlete_id == current_user.id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already exists for this mentor"
        )

    # Verify mentorship exists
    mentorship_query = select(MentorshipRequest).where(
        MentorshipRequest.athlete_id == current_user.id,
        MentorshipRequest.mentor_id == review_data.mentor_id,
        MentorshipRequest.status == RequestStatus.APPROVED
    )
    if review_data.mentorship_request_id:
        mentorship_query = mentorship_query.where(
            MentorshipRequest.id == review_data.mentorship_request_id
        )

    result = await db.execute(mentorship_query)
    mentorship = result.scalar_one_or_none()

    if not mentorship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must have an approved mentorship with this mentor to review"
        )

    # Calculate overall rating
    overall = (review_data.respectful + review_data.helpful + review_data.knowledgeable +
               review_data.safe_communication + review_data.punctual) / 5

    # Create review
    review = MentorReview(
        mentor_id=review_data.mentor_id,
        athlete_id=current_user.id,
        mentorship_request_id=review_data.mentorship_request_id,
        respectful=review_data.respectful,
        helpful=review_data.helpful,
        knowledgeable=review_data.knowledgeable,
        safe_communication=review_data.safe_communication,
        punctual=review_data.punctual,
        overall_rating=overall,
        comment=review_data.comment,
        private_safety_flag=review_data.private_safety_flag,
        safety_concern=review_data.safety_concern,
        moderated=False,
        visible=True
    )

    db.add(review)

    # Update mentor's average rating
    await update_mentor_rating(db, review_data.mentor_id)

    await db.commit()
    await db.refresh(review)

    return APIResponse(
        success=True,
        message="Review submitted",
        data=MentorReviewResponse.model_validate(review)
    )


async def update_mentor_rating(db: AsyncSession, mentor_id: UUID):
    """Update mentor's average rating"""
    from app.models.mentor import MentorProfile

    result = await db.execute(
        select(
            func.count(MentorReview.id).label("total"),
            func.avg(MentorReview.overall_rating).label("avg")
        ).where(MentorReview.mentor_id == mentor_id, MentorReview.visible == True)
    )
    stats = result.one()

    total = stats.total or 0
    avg = stats.avg or 0.0

    mentor_result = await db.execute(
        select(MentorProfile).where(MentorProfile.user_id == mentor_id)
    )
    mentor_profile = mentor_result.scalar_one_or_none()

    if mentor_profile:
        mentor_profile.total_reviews = total
        mentor_profile.average_rating = round(avg, 2)


@router.get("/my-reviews", response_model=APIResponse[List[MentorReviewResponse]])
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's own reviews (either given or received)"""
    if current_user.role.value == "ATHLETE":
        query = select(MentorReview).where(MentorReview.athlete_id == current_user.id)
    elif current_user.role.value == "MENTOR":
        query = select(MentorReview).where(MentorReview.mentor_id == current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only athletes and mentors can view reviews"
        )

    result = await db.execute(query.order_by(MentorReview.created_at.desc()))
    reviews = result.scalars().all()

    return APIResponse(
        success=True,
        message="Reviews retrieved",
        data=[MentorReviewResponse.model_validate(r) for r in reviews]
    )


@router.put("/{review_id}", response_model=APIResponse[MentorReviewResponse])
async def update_review(
    review_id: UUID,
    update_data: MentorReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a review (only owner can update)"""
    result = await db.execute(
        select(MentorReview).where(MentorReview.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Check ownership
    if review.athlete_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this review"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(review, field, value)

    # Recalculate overall if any rating changed
    if any([update_data.respectful, update_data.helpful, update_data.knowledgeable,
            update_data.safe_communication, update_data.punctual]):
        review.overall_rating = (
            review.respectful + review.helpful + review.knowledgeable +
            review.safe_communication + review.punctual
        ) / 5

    await update_mentor_rating(db, review.mentor_id)
    await db.commit()
    await db.refresh(review)

    return APIResponse(
        success=True,
        message="Review updated",
        data=MentorReviewResponse.model_validate(review)
    )


@router.delete("/{review_id}", response_model=APIResponse[dict])
async def delete_review(
    review_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a review (admin only)"""
    result = await db.execute(
        select(MentorReview).where(MentorReview.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete reviews"
        )

    mentor_id = review.mentor_id
    await db.delete(review)
    await update_mentor_rating(db, mentor_id)
    await db.commit()

    return APIResponse(
        success=True,
        message="Review deleted"
    )
