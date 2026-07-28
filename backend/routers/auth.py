"""
Authentication router — registration and login endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, get_current_user_required
from core.security import TokenData
from core.logging_config import get_logger
from schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
)
from services.auth import register_user, authenticate_user

logger = get_logger(__name__)

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account."""
    try:
        user = await register_user(data, db)
        # Auto-login after registration
        from core.security import create_access_token

        token = create_access_token(
            data={"sub": user.username, "user_id": user.id}
        )
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(
    data: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login with username and password."""
    result = await authenticate_user(data, db)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    return TokenResponse(
        access_token=result["access_token"],
        user=UserResponse.model_validate(result["user"]),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user: TokenData = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user profile."""
    from models.user import User
    from sqlalchemy import select

    result = await db.execute(
        select(User).where(User.id == user.user_id)
    )
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse.model_validate(db_user)
