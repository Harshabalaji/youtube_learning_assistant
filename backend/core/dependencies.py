"""
FastAPI dependency injection functions.
Provides database sessions, authentication, and rate limiting.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import decode_access_token, TokenData
from database.session import get_async_session

# Optional bearer token scheme (auto_error=False allows unauthenticated access)
optional_bearer = HTTPBearer(auto_error=False)
required_bearer = HTTPBearer(auto_error=True)


async def get_db() -> AsyncSession:
    """Yield an async database session."""
    async for session in get_async_session():
        yield session


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer),
) -> Optional[TokenData]:
    """
    Optionally authenticate a user. Returns None if no token is provided.
    Useful for endpoints that work for both authenticated and guest users.
    """
    if credentials is None:
        return None

    token_data = decode_access_token(credentials.credentials)
    if token_data is None:
        return None
    return token_data


async def get_current_user_required(
    credentials: HTTPAuthorizationCredentials = Depends(required_bearer),
) -> TokenData:
    """
    Require authentication. Raises 401 if token is invalid or missing.
    """
    token_data = decode_access_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data
