"""
Analysis orchestration service — coordinates the full video analysis pipeline.
"""

import asyncio
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.logging_config import get_logger
from llm.pipeline import run_full_pipeline
from models.content import GeneratedContent, Flashcard, QuizQuestion
from models.video import Video, Transcript
from rag.chunking import chunk_with_metadata, estimate_reading_level
from rag.vectorstore import store_chunks
from services.transcript import process_transcript
from services.youtube import fetch_video_metadata, fetch_transcript
from services.whisper import transcribe_with_whisper
from utils.youtube_helpers import extract_video_id

logger = get_logger(__name__)


async def analyze_video(
    url: str,
    db: AsyncSession,
    user_id: Optional[int] = None,
    llm_provider: str = None,
    model: str = None,
) -> dict:
    """
    Full video analysis pipeline:
    1. Extract video ID and validate
    2. Fetch metadata
    3. Fetch/generate transcript
    4. Clean and process transcript
    5. Chunk and embed in ChromaDB
    6. Run AI generation pipeline
    7. Store results in database

    Args:
        url: YouTube video URL.
        db: Database session.
        user_id: Optional user ID.
        llm_provider: LLM provider to use.
        model: Specific model to use.

    Returns:
        Dict with video_id and status.
    """
    # Step 1: Extract video ID
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL")

    logger.info("Starting analysis for video: {}", video_id)

    # Check if video already exists and is completed
    existing = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    existing_video = existing.scalar_one_or_none()

    if existing_video and existing_video.status == "completed":
        content_check = await db.execute(
            select(GeneratedContent).where(
                GeneratedContent.video_id == existing_video.id,
                GeneratedContent.content != None
            )
        )
        existing_contents = content_check.scalars().all()
        if len(existing_contents) >= 5:
            logger.info("Video {} already analyzed with valid content, returning existing data", video_id)
            return {
                "video_id": video_id,
                "db_id": existing_video.id,
                "status": "completed",
                "message": "Video already analyzed",
            }

    # Create or update video record
    if existing_video:
        video = existing_video
        video.status = "processing"
    else:
        video = Video(
            video_id=video_id,
            url=url,
            status="processing",
            user_id=user_id,
        )
        db.add(video)

    await db.flush()

    try:
        # Step 2: Fetch metadata
        logger.info("Fetching metadata for video: {}", video_id)
        metadata = await fetch_video_metadata(video_id)
        video.title = metadata.get("title", "Untitled")
        video.channel = metadata.get("channel")
        video.duration = metadata.get("duration")
        video.thumbnail_url = metadata.get("thumbnail_url")
        video.description = metadata.get("description")
        video.view_count = metadata.get("view_count")
        video.publish_date = metadata.get("publish_date")
        await db.flush()

        # Step 3: Fetch transcript
        logger.info("Fetching transcript for video: {}", video_id)
        transcript_data = fetch_transcript(video_id)

        if transcript_data is None:
            # Fallback to Whisper
            logger.info("YouTube transcript unavailable, trying Whisper fallback")
            transcript_data = await transcribe_with_whisper(video_id)

        if transcript_data is None:
            video.status = "failed"
            video.error_message = "Could not retrieve or generate transcript"
            await db.commit()
            raise ValueError("Transcript unavailable for this video")

        # Step 4: Clean transcript
        processed = process_transcript(transcript_data["text"])

        # Save or update transcript in DB
        existing_transcript = await db.execute(
            select(Transcript).where(Transcript.video_id == video.id)
        )
        transcript_record = existing_transcript.scalar_one_or_none()

        if transcript_record:
            # Update existing transcript
            transcript_record.raw_text = transcript_data["text"]
            transcript_record.cleaned_text = processed["cleaned_text"]
            transcript_record.source = transcript_data.get("source", "youtube")
            transcript_record.language = transcript_data.get("language", "en")
            transcript_record.segments = transcript_data.get("segments")
            logger.info("Updated existing transcript for video {}", video.id)
        else:
            # Create new transcript
            transcript_record = Transcript(
                video_id=video.id,
                raw_text=transcript_data["text"],
                cleaned_text=processed["cleaned_text"],
                source=transcript_data.get("source", "youtube"),
                language=transcript_data.get("language", "en"),
                segments=transcript_data.get("segments"),
            )
            db.add(transcript_record)

        # Clean up any stale generated content from a previous failed attempt
        if existing_video:
            from sqlalchemy import delete
            await db.execute(delete(GeneratedContent).where(GeneratedContent.video_id == video.id))
            await db.execute(delete(Flashcard).where(Flashcard.video_id == video.id))
            await db.execute(delete(QuizQuestion).where(QuizQuestion.video_id == video.id))

        video.word_count = processed["word_count"]
        video.reading_time_minutes = processed["reading_time_minutes"]
        video.reading_level = estimate_reading_level(processed["cleaned_text"])
        video.detected_language = transcript_data.get("language", "en")
        await db.flush()

        # Step 5: Chunk and embed
        logger.info("Chunking and embedding transcript")
        chunks, metadatas = chunk_with_metadata(
            processed["cleaned_text"],
            video_id,
        )
        store_chunks(video_id, chunks, metadatas)

        # Step 6: Run AI pipeline
        logger.info("Running AI generation pipeline")
        results = await run_full_pipeline(
            transcript=processed["cleaned_text"],
            title=video.title or "",
            provider=llm_provider,
            model=model,
        )

        # Step 7: Store results
        logger.info("Storing generated content")
        for content_type, result in results.items():
            if result.get("success") and result.get("content"):
                # Store as GeneratedContent
                gen_content = GeneratedContent(
                    video_id=video.id,
                    content_type=content_type,
                    content=result["content"],
                    llm_provider=llm_provider,
                    model_used=model,
                    generation_time_seconds=result.get("generation_time_seconds"),
                )
                db.add(gen_content)

                # Also store flashcards individually for bookmarking
                if content_type == "flashcards" and "flashcards" in result["content"]:
                    for fc in result["content"]["flashcards"]:
                        flashcard = Flashcard(
                            video_id=video.id,
                            question=fc.get("question", ""),
                            answer=fc.get("answer", ""),
                            difficulty=fc.get("difficulty", "medium"),
                            category=fc.get("category"),
                        )
                        db.add(flashcard)

                # Store quiz questions individually
                if content_type == "quiz" and "questions" in result["content"]:
                    for q in result["content"]["questions"]:
                        quiz_q = QuizQuestion(
                            video_id=video.id,
                            question=q.get("question", ""),
                            options=q.get("options", []),
                            correct_answer=q.get("correct_answer", 0),
                            explanation=q.get("explanation"),
                            difficulty=q.get("difficulty", "medium"),
                            category=q.get("category"),
                        )
                        db.add(quiz_q)

        # Auto-detect tags from chapter summaries
        if "chapter_summary" in results and results["chapter_summary"].get("success"):
            chapters = results["chapter_summary"]["content"].get("chapters", [])
            tags = [ch.get("title", "") for ch in chapters if ch.get("title")]
            video.tags = tags[:10]

        video.status = "completed"
        await db.commit()

        successful = sum(1 for r in results.values() if r.get("success"))
        logger.info(
            "Analysis complete for {}: {}/{} content types generated",
            video_id,
            successful,
            len(results),
        )

        return {
            "video_id": video_id,
            "db_id": video.id,
            "status": "completed",
            "content_generated": successful,
            "total_content_types": len(results),
        }

    except Exception as e:
        video.status = "failed"
        video.error_message = str(e)
        await db.commit()
        logger.error("Analysis failed for {}: {}", video_id, str(e))
        raise


async def get_video_content(video_id: str, db: AsyncSession) -> dict:
    """
    Retrieve all generated content for a video.

    Args:
        video_id: The YouTube video ID.
        db: Database session.

    Returns:
        Dict with all content types and their data.
    """
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()

    if not video:
        raise ValueError(f"Video not found: {video_id}")

    # Fetch all generated content
    content_result = await db.execute(
        select(GeneratedContent).where(GeneratedContent.video_id == video.id)
    )
    contents = content_result.scalars().all()

    # Build response
    response = {
        "video": {
            "id": video.id,
            "video_id": video.video_id,
            "url": video.url,
            "title": video.title,
            "channel": video.channel,
            "duration": video.duration,
            "thumbnail_url": video.thumbnail_url,
            "description": video.description,
            "view_count": video.view_count,
            "publish_date": video.publish_date,
            "status": video.status,
            "word_count": video.word_count,
            "reading_time_minutes": video.reading_time_minutes,
            "reading_level": video.reading_level,
            "tags": video.tags,
        },
    }

    # Add transcript if available
    if video.transcript:
        response["transcript"] = {
            "cleaned_text": video.transcript.cleaned_text,
            "source": video.transcript.source,
            "language": video.transcript.language,
            "segments": video.transcript.segments,
        }

    # Organize content by type
    for content in contents:
        response[content.content_type] = content.content

    return response
