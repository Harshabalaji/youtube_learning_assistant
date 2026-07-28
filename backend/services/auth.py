"""
Authentication service — user registration and login.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.logging_config import get_logger
from core.security import hash_password, verify_password, create_access_token
from models.user import User
from schemas.user import UserRegisterRequest, UserLoginRequest

logger = get_logger(__name__)


async def register_user(
    data: UserRegisterRequest,
    db: AsyncSession,
) -> User:
    """
    Register a new user.

    Args:
        data: Registration data.
        db: Database session.

    Returns:
        The created User object.

    Raises:
        ValueError: If username or email already exists.
    """
    # Check existing username
    result = await db.execute(
        select(User).where(User.username == data.username)
    )
    if result.scalar_one_or_none():
        raise ValueError("Username already exists")

    # Check existing email
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")

    # Create user
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.flush()

    logger.info("Registered new user: {} (id={})", user.username, user.id)
    return user


async def authenticate_user(
    data: UserLoginRequest,
    db: AsyncSession,
) -> Optional[dict]:
    """
    Authenticate a user and return a JWT token.

    Args:
        data: Login credentials.
        db: Database session.

    Returns:
        Dict with 'access_token', 'token_type', and 'user' if authenticated.
        None if authentication fails.
    """
    result = await db.execute(
        select(User).where(User.username == data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        logger.warning("Failed login attempt for: {}", data.username)
        return None

    if not user.is_active:
        logger.warning("Login attempt for deactivated user: {}", data.username)
        return None

    # Create JWT token
    token = create_access_token(
        data={"sub": user.username, "user_id": user.id}
    )

    logger.info("User logged in: {}", user.username)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }
