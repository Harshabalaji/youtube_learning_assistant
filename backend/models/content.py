"""
Generated content models — stores all AI-generated study materials.
"""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship

from database.base import Base, IDMixin, TimestampMixin


class GeneratedContent(Base, IDMixin, TimestampMixin):
    """
    Stores generated content for a video.
    Each record represents one type of content (summary, notes, flashcards, etc.).
    """

    __tablename__ = "generated_content"

    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)

    # Content type discriminator
    content_type = Column(
        String(50), nullable=False, index=True
    )  # executive_summary | detailed_summary | chapter_summary | key_takeaways |
    # notes | flashcards | quiz | interview_questions | vocabulary |
    # timeline | mindmap | action_items | faq | quotes | examples |
    # code_snippets | study_guide

    # Content data stored as JSON for flexibility
    content = Column(JSON, nullable=False)

    # Metadata
    llm_provider = Column(String(20), nullable=True)
    model_used = Column(String(50), nullable=True)
    generation_time_seconds = Column(Float, nullable=True)

    # Relationship
    video = relationship("Video", back_populates="generated_content")

    def __repr__(self):
        return (
            f"<GeneratedContent(id={self.id}, video_id={self.video_id}, "
            f"type='{self.content_type}')>"
        )


class Flashcard(Base, IDMixin, TimestampMixin):
    """Individual flashcard with bookmarking support."""

    __tablename__ = "flashcards"

    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    difficulty = Column(String(10), default="medium")  # easy | medium | hard
    category = Column(String(100), nullable=True)
    is_bookmarked = Column(Integer, default=0)  # SQLite-friendly boolean

    def __repr__(self):
        return f"<Flashcard(id={self.id}, difficulty='{self.difficulty}')>"


class QuizQuestion(Base, IDMixin, TimestampMixin):
    """Individual quiz question with options and explanation."""

    __tablename__ = "quiz_questions"

    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of 4 options
    correct_answer = Column(Integer, nullable=False)  # Index of correct option (0-3)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(10), default="medium")
    category = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<QuizQuestion(id={self.id}, difficulty='{self.difficulty}')>"


class QuizAttempt(Base, IDMixin, TimestampMixin):
    """Records a user's quiz attempt and score."""

    __tablename__ = "quiz_attempts"

    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    answers = Column(JSON, nullable=True)  # User's answers

    def __repr__(self):
        return f"<QuizAttempt(id={self.id}, score={self.score}/{self.total_questions})>"
