"""
User database model for authentication and profile management.
"""

from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship

from database.base import Base, IDMixin, TimestampMixin


class User(Base, IDMixin, TimestampMixin):
    """User account model."""

    __tablename__ = "users"

    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    preferred_llm_provider = Column(String(20), default="openai")
    preferred_model = Column(String(50), default="gpt-4.1")

    # Relationships
    videos = relationship("Video", back_populates="user", lazy="selectin")
    chat_sessions = relationship("ChatSession", back_populates="user", lazy="selectin")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"
