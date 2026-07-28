"""
User Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Request Schemas ──────────────────────────────────────────────


class UserRegisterRequest(BaseModel):
    """Schema for user registration."""

    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = Field(None, max_length=100)


class UserLoginRequest(BaseModel):
    """Schema for user login."""

    username: str
    password: str


class UserUpdateRequest(BaseModel):
    """Schema for updating user profile."""

    full_name: Optional[str] = None
    preferred_llm_provider: Optional[str] = None
    preferred_model: Optional[str] = None


# ── Response Schemas ─────────────────────────────────────────────


class UserResponse(BaseModel):
    """User data returned in API responses."""

    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    preferred_llm_provider: str
    preferred_model: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token response after successful login."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
