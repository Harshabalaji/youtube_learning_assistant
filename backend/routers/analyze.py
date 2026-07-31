"""
Analysis router — handles video analysis requests.
"""

import asyncio
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
from database.session import async_session_factory

logger = get_logger(__name__)

router = APIRouter()


async def _run_analysis_background(
    url: str,
    user_id: int | None,
    llm_provider: str | None,
    model: str | None,
):
    """Run the full analysis pipeline in a background task with its own session."""
    async with async_session_factory() as db:
        try:
            await analyze_video(
                url=url,
                db=db,
                user_id=user_id,
                llm_provider=llm_provider,
                model=model,
            )
        except Exception as exc:
            logger.error("Background analysis failed for {}: {}", url, str(exc))


@router.post("/analyze")
async def start_analysis(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user_optional),
):
    """
    Start video analysis in the background.

    Returns immediately with { status: "processing" } so the browser is
    never blocked.  Poll GET /api/analyze/{video_id}/status to track progress.
    """
    try:
        video_id = extract_video_id(request.url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")

        user_id = user.user_id if user else None

        # Check if already completed with valid content
        existing = await db.execute(
            select(Video).where(Video.video_id == video_id)
        )
        existing_video = existing.scalar_one_or_none()

        if existing_video and existing_video.status == "completed":
            return {
                "success": True,
                "data": {
                    "video_id": video_id,
                    "db_id": existing_video.id,
                    "status": "completed",
                    "message": "Video already analyzed",
                },
            }

        # Queue the analysis as a background task so we return instantly
        background_tasks.add_task(
            _run_analysis_background,
            url=request.url,
            user_id=user_id,
            llm_provider=request.llm_provider,
            model=request.model,
        )

        return {
            "success": True,
            "data": {
                "video_id": video_id,
                "status": "processing",
                "message": "Analysis started. Poll /api/analyze/{video_id}/status for progress.",
            },
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to queue analysis: {}", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")


@router.get("/analyze/{video_id}/status")
async def get_analysis_status(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Poll the status of a video analysis.
    Returns one of: processing | completed | failed | not_found
    """
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()

    if not video:
        # Not yet in DB — still being inserted by the background task
        return {"video_id": video_id, "status": "processing", "error_message": None}

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
