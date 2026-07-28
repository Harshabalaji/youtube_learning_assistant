"""
Chat router — handles RAG-powered chat interactions.
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, get_current_user_optional
from core.security import TokenData
from core.logging_config import get_logger
from schemas.chat import ChatRequest
from services.chat import process_chat_message, get_chat_sessions, get_chat_messages

logger = get_logger(__name__)

router = APIRouter()


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user_optional),
):
    """
    Send a chat message about a video. Uses RAG to retrieve relevant context
    and generate an informed answer.
    """
    try:
        user_id = user.user_id if user else None

        result = await process_chat_message(
            video_id=request.video_id,
            message=request.message,
            db=db,
            session_id=request.session_id,
            user_id=user_id,
            provider=request.llm_provider,
            model=request.model,
        )

        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Chat error: {}", str(e))
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user_optional),
):
    """
    Send a chat message with streaming response.
    Returns Server-Sent Events (SSE).
    """
    from rag.retriever import retrieve_and_stream
    from models.video import Video
    from models.chat import ChatSession, ChatMessage
    from sqlalchemy import select

    # Validate video exists
    result = await db.execute(
        select(Video).where(Video.video_id == request.video_id)
    )
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    async def event_generator():
        full_response = ""
        sources = []

        try:
            async for chunk in retrieve_and_stream(
                video_id=request.video_id,
                question=request.message,
                provider=request.llm_provider,
                model=request.model,
            ):
                if chunk["type"] == "content":
                    full_response += chunk["data"]
                    yield f"data: {json.dumps({'type': 'content', 'data': chunk['data']})}\n\n"
                elif chunk["type"] == "sources":
                    sources = chunk["data"]
                    yield f"data: {json.dumps({'type': 'sources', 'data': sources})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/chat/sessions/{video_id}")
async def list_chat_sessions(
    video_id: str,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user_optional),
):
    """List all chat sessions for a video."""
    user_id = user.user_id if user else None
    sessions = await get_chat_sessions(video_id, db, user_id)
    return {"success": True, "data": {"sessions": sessions, "total": len(sessions)}}


@router.get("/chat/messages/{session_id}")
async def list_chat_messages(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get all messages in a chat session."""
    messages = await get_chat_messages(session_id, db)
    return {"success": True, "data": {"messages": messages, "total": len(messages)}}
