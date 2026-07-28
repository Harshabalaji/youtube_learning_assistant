"""
Content router — endpoints for specific content types (summaries, notes, flashcards, etc.).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_db
from core.logging_config import get_logger
from models.content import GeneratedContent, Flashcard, QuizQuestion, QuizAttempt
from models.video import Video

logger = get_logger(__name__)

router = APIRouter()


async def _get_content_by_type(video_id: str, content_type: str, db: AsyncSession):
    """Helper to retrieve specific content type for a video."""
    result = await db.execute(
        select(Video).where(Video.video_id == video_id)
    )
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    content_result = await db.execute(
        select(GeneratedContent).where(
            GeneratedContent.video_id == video.id,
            GeneratedContent.content_type == content_type,
        )
    )
    content = content_result.scalar_one_or_none()
    if not content:
        raise HTTPException(
            status_code=404,
            detail=f"No {content_type} generated for this video",
        )

    return content.content


@router.get("/summary/{video_id}")
async def get_summary(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get all summaries for a video."""
    result = await db.execute(select(Video).where(Video.video_id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    content_result = await db.execute(
        select(GeneratedContent).where(
            GeneratedContent.video_id == video.id,
            GeneratedContent.content_type.in_([
                "executive_summary",
                "detailed_summary",
                "chapter_summary",
                "key_takeaways",
            ]),
        )
    )
    contents = content_result.scalars().all()

    response = {}
    for c in contents:
        response[c.content_type] = c.content

    return {"success": True, "data": response}


@router.get("/notes/{video_id}")
async def get_notes(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get structured notes for a video."""
    content = await _get_content_by_type(video_id, "notes", db)
    return {"success": True, "data": content}


@router.get("/flashcards/{video_id}")
async def get_flashcards(
    video_id: str,
    difficulty: str = Query(None, description="Filter by difficulty"),
    category: str = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
):
    """Get flashcards for a video with optional filtering."""
    result = await db.execute(select(Video).where(Video.video_id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    query = select(Flashcard).where(Flashcard.video_id == video.id)
    if difficulty:
        query = query.where(Flashcard.difficulty == difficulty)
    if category:
        query = query.where(Flashcard.category == category)

    result = await db.execute(query)
    flashcards = result.scalars().all()

    return {
        "success": True,
        "data": {
            "flashcards": [
                {
                    "id": fc.id,
                    "question": fc.question,
                    "answer": fc.answer,
                    "difficulty": fc.difficulty,
                    "category": fc.category,
                    "is_bookmarked": bool(fc.is_bookmarked),
                }
                for fc in flashcards
            ],
            "total": len(flashcards),
        },
    }


@router.put("/flashcards/{flashcard_id}/bookmark")
async def toggle_bookmark(flashcard_id: int, db: AsyncSession = Depends(get_db)):
    """Toggle bookmark status of a flashcard."""
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id)
    )
    flashcard = result.scalar_one_or_none()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    flashcard.is_bookmarked = 0 if flashcard.is_bookmarked else 1
    await db.commit()

    return {"success": True, "is_bookmarked": bool(flashcard.is_bookmarked)}


@router.get("/quiz/{video_id}")
async def get_quiz(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get quiz questions for a video."""
    result = await db.execute(select(Video).where(Video.video_id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.video_id == video.id)
    )
    questions = result.scalars().all()

    return {
        "success": True,
        "data": {
            "questions": [
                {
                    "id": q.id,
                    "question": q.question,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                    "difficulty": q.difficulty,
                    "category": q.category,
                }
                for q in questions
            ],
            "total": len(questions),
        },
    }


@router.post("/quiz/{video_id}/submit")
async def submit_quiz(
    video_id: str,
    answers: list[int],
    time_taken: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Submit quiz answers and get results."""
    result = await db.execute(select(Video).where(Video.video_id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.video_id == video.id)
    )
    questions = result.scalars().all()

    if not questions:
        raise HTTPException(status_code=404, detail="No quiz questions found")

    # Calculate score
    score = 0
    results_detail = []
    for i, q in enumerate(questions):
        user_answer = answers[i] if i < len(answers) else -1
        is_correct = user_answer == q.correct_answer
        if is_correct:
            score += 1

        results_detail.append({
            "question": q.question,
            "options": q.options,
            "user_answer": user_answer,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "explanation": q.explanation,
        })

    # Save attempt
    attempt = QuizAttempt(
        video_id=video.id,
        score=score,
        total_questions=len(questions),
        time_taken_seconds=time_taken,
        answers=answers,
    )
    db.add(attempt)
    await db.commit()

    return {
        "success": True,
        "data": {
            "score": score,
            "total": len(questions),
            "percentage": round(score / len(questions) * 100, 1),
            "time_taken_seconds": time_taken,
            "results": results_detail,
        },
    }


@router.get("/mindmap/{video_id}")
async def get_mindmap(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get mind map (Mermaid syntax) for a video."""
    content = await _get_content_by_type(video_id, "mindmap", db)
    return {"success": True, "data": content}


@router.get("/timeline/{video_id}")
async def get_timeline(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get timeline for a video."""
    content = await _get_content_by_type(video_id, "timeline", db)
    return {"success": True, "data": content}


@router.get("/vocabulary/{video_id}")
async def get_vocabulary(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get vocabulary for a video."""
    content = await _get_content_by_type(video_id, "vocabulary", db)
    return {"success": True, "data": content}


@router.get("/interview/{video_id}")
async def get_interview_questions(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get interview questions for a video."""
    content = await _get_content_by_type(video_id, "interview_questions", db)
    return {"success": True, "data": content}


@router.get("/study-guide/{video_id}")
async def get_study_guide(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get study guide for a video."""
    content = await _get_content_by_type(video_id, "study_guide", db)
    return {"success": True, "data": content}


@router.get("/content/{video_id}/{content_type}")
async def get_content_generic(
    video_id: str,
    content_type: str,
    db: AsyncSession = Depends(get_db),
):
    """Get any content type for a video."""
    content = await _get_content_by_type(video_id, content_type, db)
    return {"success": True, "data": content}
