"""
Chat service — handles RAG-powered conversations about videos.
"""

from typing import Optional, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.logging_config import get_logger
from models.chat import ChatSession, ChatMessage
from models.video import Video
from rag.retriever import retrieve_and_answer, retrieve_and_stream

logger = get_logger(__name__)


async def process_chat_message(
    video_id: str,
    message: str,
    db: AsyncSession,
    session_id: Optional[int] = None,
    user_id: Optional[int] = None,
    provider: str = None,
    model: str = None,
) -> dict:
    """
    Process a chat message: retrieve context, generate answer, save to history.

    Args:
        video_id: YouTube video ID.
        message: User's message/question.
        db: Database session.
        session_id: Existing chat session ID (creates new if None).
        user_id: Optional user ID.
        provider: LLM provider.
        model: LLM model.

    Returns:
        Dict with response message, sources, and session info.
    """
    # Find the video record
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()
    if not video:
        raise ValueError(f"Video not found: {video_id}")

    # Get or create chat session
    if session_id:
        session_result = await db.execute(
            select(ChatSession).where(ChatSession.id == session_id)
        )
        session = session_result.scalar_one_or_none()
        if not session:
            raise ValueError(f"Chat session not found: {session_id}")
    else:
        session = ChatSession(
            video_id=video.id,
            user_id=user_id,
            title=message[:100],
        )
        db.add(session)
        await db.flush()

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=message,
    )
    db.add(user_msg)
    await db.flush()

    # Get chat history for context
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at)
    )
    history_messages = history_result.scalars().all()
    chat_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages[:-1]  # Exclude current message
    ]

    # Generate answer via RAG
    rag_result = await retrieve_and_answer(
        video_id=video_id,
        question=message,
        chat_history=chat_history,
        provider=provider,
        model=model,
    )

    # Save assistant response
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=rag_result["answer"],
        sources=rag_result.get("sources"),
    )
    db.add(assistant_msg)
    await db.commit()

    return {
        "session_id": session.id,
        "message": {
            "id": assistant_msg.id,
            "role": "assistant",
            "content": rag_result["answer"],
            "sources": rag_result.get("sources"),
            "created_at": assistant_msg.created_at,
        },
        "sources": rag_result.get("sources"),
    }


async def get_chat_sessions(
    video_id: str,
    db: AsyncSession,
    user_id: Optional[int] = None,
) -> list:
    """Get all chat sessions for a video."""
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()
    if not video:
        return []

    query = select(ChatSession).where(ChatSession.video_id == video.id)
    if user_id:
        query = query.where(ChatSession.user_id == user_id)
    query = query.order_by(ChatSession.created_at.desc())

    result = await db.execute(query)
    sessions = result.scalars().all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "message_count": len(s.messages) if s.messages else 0,
        }
        for s in sessions
    ]


async def get_chat_messages(
    session_id: int,
    db: AsyncSession,
) -> list:
    """Get all messages in a chat session."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()

    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "sources": msg.sources,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]
