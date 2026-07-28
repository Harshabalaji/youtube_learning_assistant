"""
Video and transcript Pydantic schemas.
"""

from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, Field, field_validator
import re


# ── Request Schemas ──────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    """Request to analyze a YouTube video."""

    url: str = Field(..., description="YouTube video URL")
    llm_provider: Optional[str] = Field("openai", description="LLM provider to use")
    model: Optional[str] = Field(None, description="Specific model to use")

    @field_validator("url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        """Validate that the URL is a valid YouTube URL."""
        patterns = [
            r"(?:https?://)?(?:www\.)?youtube\.com/watch\?v=[\w-]{11}",
            r"(?:https?://)?youtu\.be/[\w-]{11}",
            r"(?:https?://)?(?:www\.)?youtube\.com/embed/[\w-]{11}",
            r"(?:https?://)?(?:www\.)?youtube\.com/shorts/[\w-]{11}",
        ]
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError("Invalid YouTube URL")
        return v


# ── Response Schemas ─────────────────────────────────────────────


class TranscriptSegment(BaseModel):
    """A timestamped segment of the transcript."""

    start: float
    duration: float
    text: str


class TranscriptResponse(BaseModel):
    """Transcript data response."""

    raw_text: str
    cleaned_text: Optional[str] = None
    source: str  # youtube | whisper
    language: str = "en"
    segments: Optional[List[TranscriptSegment]] = None

    model_config = {"from_attributes": True}


class VideoMetadata(BaseModel):
    """Video metadata response."""

    video_id: str
    url: str
    title: Optional[str] = None
    channel: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None
    view_count: Optional[int] = None
    publish_date: Optional[str] = None

    model_config = {"from_attributes": True}


class VideoResponse(BaseModel):
    """Complete video response including metadata and status."""

    id: int
    video_id: str
    url: str
    title: Optional[str] = None
    channel: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None
    view_count: Optional[int] = None
    publish_date: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    word_count: Optional[int] = None
    reading_time_minutes: Optional[float] = None
    reading_level: Optional[str] = None
    detected_language: str = "en"
    tags: Optional[List[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class VideoListResponse(BaseModel):
    """List of videos for history."""

    videos: List[VideoResponse]
    total: int


class AnalysisStatusResponse(BaseModel):
    """Status of an ongoing analysis."""

    video_id: str
    status: str  # pending | processing | completed | failed
    progress: Optional[int] = None  # 0-100
    current_step: Optional[str] = None
    error_message: Optional[str] = None
