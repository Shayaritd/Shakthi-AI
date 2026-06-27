"""
Authentication Routes
User registration, login, token refresh, and profile
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request  # ← Added Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_tokens,
    decode_refresh_token,
)
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate, Token, TokenRefresh
)
from app.schemas.common import APIResponse, MessageResponse


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(
    request: Request,  # ← Added
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    Available roles: ATHLETE, MENTOR, GUARDIAN
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if phone number already exists
    result = await db.execute(
        select(User).where(User.phone_number == user_data.phone_number)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    # Create user
    user = User(
        full_name=user_data.full_name,
        email=user_data.email.lower(),
        phone_number=user_data.phone_number,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        verified=False,
        is_active=True,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return APIResponse(
        success=True,
        message="User registered successfully",
        data=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=APIResponse[Token])
@limiter.limit("10/minute")
async def login(
    request: Request,  # ← Added
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password.
    Returns access and refresh tokens.
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email.lower())
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Create tokens
    tokens = create_tokens(str(user.id), user.role)

    return APIResponse(
        success=True,
        message="Login successful",
        data=Token(**tokens)
    )


@router.post("/refresh", response_model=APIResponse[Token])
async def refresh_token(
    token_data: TokenRefresh,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    payload = decode_refresh_token(token_data.refresh_token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new tokens
    tokens = create_tokens(str(user.id), user.role)

    return APIResponse(
        success=True,
        message="Token refreshed",
        data=Token(**tokens)
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user.
    In production, add token to blacklist in Redis.
    """
    # TODO: Add token to Redis blacklist
    return MessageResponse(
        success=True,
        message="Logged out successfully"
    )


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user's profile"""
    return APIResponse(
        success=True,
        message="User profile retrieved",
        data=UserResponse.model_validate(current_user)
    )


@router.put("/me", response_model=APIResponse[UserResponse])
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile"""
    if update_data.full_name:
        current_user.full_name = update_data.full_name

    if update_data.phone_number:
        # Check if phone is already taken
        result = await db.execute(
            select(User).where(
                User.phone_number == update_data.phone_number,
                User.id != current_user.id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
        current_user.phone_number = update_data.phone_number

    await db.commit()
    await db.refresh(current_user)

    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data=UserResponse.model_validate(current_user)
    )