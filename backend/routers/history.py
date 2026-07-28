"""
History router — view previously analyzed videos.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, get_current_user_optional
from core.security import TokenData
from core.logging_config import get_logger
from models.video import Video

logger = get_logger(__name__)

router = APIRouter()


@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user_optional),
):
    """
    Get video analysis history.
    Returns paginated list of previously analyzed videos.
    """
    query = select(Video).order_by(desc(Video.created_at))

    # If authenticated, show only user's videos
    if user:
        query = query.where(Video.user_id == user.user_id)

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    videos = result.scalars().all()

    # Count total
    count_query = select(Video)
    if user:
        count_query = count_query.where(Video.user_id == user.user_id)
    count_result = await db.execute(count_query)
    total = len(count_result.scalars().all())

    return {
        "success": True,
        "data": {
            "videos": [
                {
                    "id": v.id,
                    "video_id": v.video_id,
                    "url": v.url,
                    "title": v.title,
                    "channel": v.channel,
                    "duration": v.duration,
                    "thumbnail_url": v.thumbnail_url,
                    "status": v.status,
                    "word_count": v.word_count,
                    "reading_time_minutes": v.reading_time_minutes,
                    "tags": v.tags,
                    "created_at": v.created_at.isoformat() if v.created_at else None,
                }
                for v in videos
            ],
            "total": total,
            "page": page,
            "limit": limit,
        },
    }


@router.delete("/history/{video_id}")
async def delete_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a video and all its generated content."""
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete from ChromaDB
    from rag.vectorstore import delete_collection
    delete_collection(video_id)

    # Delete from database (cascade deletes related records)
    await db.delete(video)
    await db.commit()

    logger.info("Deleted video: {}", video_id)
    return {"success": True, "message": f"Video {video_id} deleted"}
