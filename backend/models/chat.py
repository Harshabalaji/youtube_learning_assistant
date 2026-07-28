"""
Chat and conversation history models for the RAG chatbot.
"""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship

from database.base import Base, IDMixin, TimestampMixin


class ChatSession(Base, IDMixin, TimestampMixin):
    """A chat session associated with a video."""

    __tablename__ = "chat_sessions"

    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(200), default="New Chat")
    is_active = Column(Integer, default=1)  # SQLite-friendly boolean

    # Relationships
    video = relationship("Video", back_populates="chat_sessions")
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship(
        "ChatMessage",
        back_populates="session",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )

    def __repr__(self):
        return f"<ChatSession(id={self.id}, video_id={self.video_id})>"


class ChatMessage(Base, IDMixin, TimestampMixin):
    """Individual chat message within a session."""

    __tablename__ = "chat_messages"

    session_id = Column(
        Integer, ForeignKey("chat_sessions.id"), nullable=False, index=True
    )
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)  # Retrieved source chunks for citations
    metadata_ = Column("metadata", JSON, nullable=True)  # Additional metadata

    # Relationship
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role='{self.role}')>"
