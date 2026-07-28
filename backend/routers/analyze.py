"""
Analysis router — handles video analysis requests.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db, get_current_user_optional
from core.security import TokenData
from core.logging_config import get_logger
from schemas.video import AnalyzeRequest, AnalysisStatusResponse, VideoResponse
from services.analysis import analyze_video, get_video_content
from utils.youtube_helpers import extract_video_id
from models.video import Video
from sqlalchemy import select

logger = get_logger(__name__)

router = APIRouter()

# In-memory progress tracking for background tasks
_analysis_progress: dict[str, dict] = {}


@router.post("/analyze")
async def start_analysis(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user_optional),
):
    """
    Start video analysis. Runs the full AI pipeline.

    This endpoint processes the video synchronously for simplicity.
    For very long videos, consider using a task queue.
    """
    try:
        user_id = user.user_id if user else None

        result = await analyze_video(
            url=request.url,
            db=db,
            user_id=user_id,
            llm_provider=request.llm_provider,
            model=request.model,
        )

        return {
            "success": True,
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Analysis failed: {}", str(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analyze/{video_id}/status")
async def get_analysis_status(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the status of a video analysis."""
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return AnalysisStatusResponse(
        video_id=video_id,
        status=video.status,
        error_message=video.error_message,
    )


@router.get("/video/{video_id}")
async def get_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get complete video data including all generated content."""
    try:
        content = await get_video_content(video_id, db)
        return {"success": True, "data": content}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
