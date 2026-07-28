"""
Pydantic schemas for all generated content types.
"""

from datetime import datetime
from typing import Optional, List, Any, Dict

from pydantic import BaseModel, Field


# ── Summary ──────────────────────────────────────────────────────


class ExecutiveSummary(BaseModel):
    """100-150 word executive summary."""

    summary: str
    word_count: int


class DetailedSummary(BaseModel):
    """1000+ word detailed summary."""

    summary: str
    word_count: int


class ChapterSummary(BaseModel):
    """A single chapter/topic summary."""

    title: str
    summary: str
    start_time: Optional[str] = None
    key_points: List[str] = []


class ChapterSummaryList(BaseModel):
    """List of chapter-wise summaries."""

    chapters: List[ChapterSummary]


# ── Key Takeaways ────────────────────────────────────────────────


class KeyTakeaways(BaseModel):
    """Bullet-point key takeaways."""

    takeaways: List[str]


# ── Notes ────────────────────────────────────────────────────────


class NotesSection(BaseModel):
    """A section of structured notes."""

    heading: str
    content: str  # Markdown formatted
    subsections: List["NotesSection"] = []


class StructuredNotes(BaseModel):
    """Complete structured notes in markdown."""

    title: str
    sections: List[NotesSection]
    markdown: str  # Full markdown string


# ── Flashcards ───────────────────────────────────────────────────


class FlashcardSchema(BaseModel):
    """A single flashcard."""

    id: Optional[int] = None
    question: str
    answer: str
    difficulty: str = "medium"  # easy | medium | hard
    category: Optional[str] = None
    is_bookmarked: bool = False

    model_config = {"from_attributes": True}


class FlashcardListResponse(BaseModel):
    """List of flashcards."""

    flashcards: List[FlashcardSchema]
    total: int


# ── Quiz ─────────────────────────────────────────────────────────


class QuizQuestionSchema(BaseModel):
    """A single quiz question."""

    id: Optional[int] = None
    question: str
    options: List[str]  # 4 options
    correct_answer: int  # Index 0-3
    explanation: Optional[str] = None
    difficulty: str = "medium"
    category: Optional[str] = None

    model_config = {"from_attributes": True}


class QuizResponse(BaseModel):
    """Complete quiz."""

    questions: List[QuizQuestionSchema]
    total: int


class QuizSubmitRequest(BaseModel):
    """Submit quiz answers."""

    video_id: str
    answers: List[int]  # List of selected option indices
    time_taken_seconds: int


class QuizResultResponse(BaseModel):
    """Quiz result after submission."""

    score: int
    total: int
    percentage: float
    time_taken_seconds: int
    results: List[Dict[str, Any]]  # Detailed question-by-question results


# ── Interview Questions ──────────────────────────────────────────


class InterviewQuestion(BaseModel):
    """A single interview question."""

    question: str
    suggested_answer: str
    difficulty: str  # easy | medium | hard
    category: Optional[str] = None


class InterviewQuestionList(BaseModel):
    """List of interview questions."""

    questions: List[InterviewQuestion]


# ── Vocabulary ───────────────────────────────────────────────────


class VocabularyWord(BaseModel):
    """A vocabulary word with definition and example."""

    word: str
    meaning: str
    example: str
    context: Optional[str] = None  # Context from the video


class VocabularyList(BaseModel):
    """List of vocabulary words."""

    words: List[VocabularyWord]


# ── Timeline ─────────────────────────────────────────────────────


class TimelineEvent(BaseModel):
    """A single timeline event."""

    time: str  # Timestamp or period
    title: str
    description: str


class Timeline(BaseModel):
    """Chronological timeline."""

    events: List[TimelineEvent]


# ── Mind Map ─────────────────────────────────────────────────────


class MindMapResponse(BaseModel):
    """Mermaid-syntax mind map."""

    mermaid_code: str
    central_topic: str


# ── Action Items ─────────────────────────────────────────────────


class ActionItem(BaseModel):
    """A single action item."""

    action: str
    priority: str = "medium"  # low | medium | high
    category: Optional[str] = None


class ActionItemList(BaseModel):
    """List of action items."""

    items: List[ActionItem]


# ── FAQ ──────────────────────────────────────────────────────────


class FAQItem(BaseModel):
    """A single FAQ entry."""

    question: str
    answer: str


class FAQList(BaseModel):
    """List of FAQs."""

    faqs: List[FAQItem]


# ── Quotes ───────────────────────────────────────────────────────


class ImportantQuote(BaseModel):
    """An important quote from the video."""

    quote: str
    context: Optional[str] = None
    timestamp: Optional[str] = None


class QuoteList(BaseModel):
    """List of important quotes."""

    quotes: List[ImportantQuote]


# ── Examples ─────────────────────────────────────────────────────


class RealWorldExample(BaseModel):
    """A real-world example mentioned in the video."""

    title: str
    description: str
    relevance: str


class ExampleList(BaseModel):
    """List of real-world examples."""

    examples: List[RealWorldExample]


# ── Code Snippets ────────────────────────────────────────────────


class CodeSnippet(BaseModel):
    """A code snippet from the video."""

    language: str
    code: str
    description: str
    timestamp: Optional[str] = None


class CodeSnippetList(BaseModel):
    """List of code snippets."""

    snippets: List[CodeSnippet]


# ── Study Guide ──────────────────────────────────────────────────


class StudyGuideSection(BaseModel):
    """A section of the study guide."""

    title: str
    content: str
    key_concepts: List[str] = []
    review_questions: List[str] = []


class StudyGuide(BaseModel):
    """Complete study guide."""

    title: str
    overview: str
    sections: List[StudyGuideSection]
    suggested_reading: List[str] = []
    estimated_study_time: Optional[str] = None


# ── Complete Analysis Response ───────────────────────────────────


class CompleteAnalysisResponse(BaseModel):
    """All generated content for a video."""

    video: VideoMetadata = None
    executive_summary: Optional[ExecutiveSummary] = None
    detailed_summary: Optional[DetailedSummary] = None
    chapter_summary: Optional[ChapterSummaryList] = None
    key_takeaways: Optional[KeyTakeaways] = None
    notes: Optional[StructuredNotes] = None
    flashcards: Optional[FlashcardListResponse] = None
    quiz: Optional[QuizResponse] = None
    interview_questions: Optional[InterviewQuestionList] = None
    vocabulary: Optional[VocabularyList] = None
    timeline: Optional[Timeline] = None
    mindmap: Optional[MindMapResponse] = None
    action_items: Optional[ActionItemList] = None
    faq: Optional[FAQList] = None
    quotes: Optional[QuoteList] = None
    examples: Optional[ExampleList] = None
    code_snippets: Optional[CodeSnippetList] = None
    study_guide: Optional[StudyGuide] = None


class VideoMetadata(BaseModel):
    """Inline video metadata for analysis response."""

    video_id: str
    title: Optional[str] = None
    channel: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None


# ── Export ────────────────────────────────────────────────────────


class ExportRequest(BaseModel):
    """Request to export content."""

    video_id: str
    format: str = "pdf"  # pdf | markdown | docx
    sections: Optional[List[str]] = None  # None = all sections
