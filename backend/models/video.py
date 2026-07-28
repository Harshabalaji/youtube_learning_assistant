"""
Video and Transcript database models.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship

from database.base import Base, IDMixin, TimestampMixin


class Video(Base, IDMixin, TimestampMixin):
    """Represents an analyzed YouTube video."""

    __tablename__ = "videos"

    # YouTube metadata
    video_id = Column(String(20), unique=True, nullable=False, index=True)
    url = Column(String(500), nullable=False)
    title = Column(String(500), nullable=True)
    channel = Column(String(200), nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    thumbnail_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    view_count = Column(Integer, nullable=True)
    publish_date = Column(String(50), nullable=True)

    # Processing status
    status = Column(
        String(20), default="pending", nullable=False
    )  # pending | processing | completed | failed
    error_message = Column(Text, nullable=True)

    # Analysis metadata
    word_count = Column(Integer, nullable=True)
    reading_time_minutes = Column(Float, nullable=True)
    reading_level = Column(String(20), nullable=True)
    detected_language = Column(String(10), default="en")
    tags = Column(JSON, nullable=True)  # Auto-detected tags

    # User association (nullable for guest users)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="videos")
    transcript = relationship(
        "Transcript",
        back_populates="video",
        uselist=False,
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    generated_content = relationship(
        "GeneratedContent",
        back_populates="video",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    chat_sessions = relationship(
        "ChatSession",
        back_populates="video",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Video(id={self.id}, video_id='{self.video_id}', title='{self.title}')>"


class Transcript(Base, IDMixin, TimestampMixin):
    """Stores the transcript for a video."""

    __tablename__ = "transcripts"

    video_id = Column(
        Integer, ForeignKey("videos.id"), unique=True, nullable=False
    )
    raw_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=True)
    source = Column(
        String(20), default="youtube"
    )  # youtube | whisper
    language = Column(String(10), default="en")
    segments = Column(JSON, nullable=True)  # Timestamped segments

    # Relationship
    video = relationship("Video", back_populates="transcript")

    def __repr__(self):
        return f"<Transcript(id={self.id}, video_id={self.video_id}, source='{self.source}')>"
