"""
Export router — handles PDF, DOCX, and Markdown exports.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from core.logging_config import get_logger
from services.analysis import get_video_content
from services.export import export_pdf, export_docx, export_markdown_file

logger = get_logger(__name__)

router = APIRouter()


@router.get("/export/{video_id}/{format}")
async def export_content(
    video_id: str,
    format: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Export generated content in the specified format.

    Supported formats: pdf, docx, markdown
    """
    if format not in ("pdf", "docx", "markdown"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {format}. Use 'pdf', 'docx', or 'markdown'.",
        )

    try:
        # Get all content for the video
        content = await get_video_content(video_id, db)

        video_title = content.get("video", {}).get("title", "YouTube Video")
        
        # Remove non-content keys
        export_data = {
            k: v for k, v in content.items()
            if k not in ("video", "transcript")
        }

        if format == "pdf":
            filepath = export_pdf(export_data, video_title, video_id)
            return FileResponse(
                filepath,
                media_type="application/pdf",
                filename=f"study_material_{video_id}.pdf",
            )

        elif format == "docx":
            filepath = export_docx(export_data, video_title, video_id)
            return FileResponse(
                filepath,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                filename=f"study_material_{video_id}.docx",
            )

        elif format == "markdown":
            filepath = export_markdown_file(export_data, video_title, video_id)
            return FileResponse(
                filepath,
                media_type="text/markdown",
                filename=f"study_material_{video_id}.md",
            )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Export failed: {}", str(e))
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
