"""
Chat and conversation Pydantic schemas.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


# ── Request Schemas ──────────────────────────────────────────────


class ChatRequest(BaseModel):
    """Send a chat message about a video."""

    video_id: str = Field(..., description="YouTube video ID")
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[int] = Field(None, description="Existing chat session ID")
    llm_provider: Optional[str] = None
    model: Optional[str] = None


# ── Response Schemas ─────────────────────────────────────────────


class SourceChunk(BaseModel):
    """A source chunk used for citation."""

    text: str
    relevance_score: Optional[float] = None
    timestamp: Optional[str] = None


class ChatMessageResponse(BaseModel):
    """A single chat message in the conversation."""

    id: int
    role: str  # user | assistant
    content: str
    sources: Optional[List[SourceChunk]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatResponse(BaseModel):
    """Response to a chat message."""

    session_id: int
    message: ChatMessageResponse
    sources: Optional[List[SourceChunk]] = None


class ChatSessionResponse(BaseModel):
    """Chat session with messages."""

    id: int
    video_id: int
    title: str
    messages: List[ChatMessageResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    """List of chat sessions."""

    sessions: List[ChatSessionResponse]
    total: int
