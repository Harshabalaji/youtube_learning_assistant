"""
Base prompt utilities and shared templates.
"""

# System role used across all prompts
SYSTEM_ROLE = """You are an expert educational content creator and learning specialist. 
You analyze video transcripts and generate high-quality study materials. 
Your outputs are always accurate, well-structured, and pedagogically sound.
Always respond with valid JSON matching the exact schema requested."""

# Instruction for JSON output
JSON_INSTRUCTION = """
CRITICAL: Your response must be valid JSON only. No markdown code fences, no explanations outside the JSON.
Do not include ```json or ``` markers. Return raw JSON only."""


def build_transcript_context(transcript: str, title: str = "", max_chars: int = 30000) -> str:
    """
    Build a context string from a transcript, truncating if necessary.
    
    Args:
        transcript: The cleaned transcript text.
        title: Optional video title for context.
        max_chars: Maximum characters to include.
        
    Returns:
        Formatted context string.
    """
    truncated = transcript[:max_chars]
    if len(transcript) > max_chars:
        truncated += "\n\n[... transcript truncated for length ...]"
    
    context = ""
    if title:
        context += f"Video Title: {title}\n\n"
    context += f"Transcript:\n{truncated}"
    
    return context


def get_content_type_prompt(content_type: str) -> str:
    """Map content type to its prompt function name."""
    mapping = {
        "executive_summary": "get_executive_summary_prompt",
        "detailed_summary": "get_detailed_summary_prompt",
        "chapter_summary": "get_chapter_summary_prompt",
        "key_takeaways": "get_key_takeaways_prompt",
        "notes": "get_notes_prompt",
        "flashcards": "get_flashcards_prompt",
        "quiz": "get_quiz_prompt",
        "interview_questions": "get_interview_prompt",
        "vocabulary": "get_vocabulary_prompt",
        "timeline": "get_timeline_prompt",
        "mindmap": "get_mindmap_prompt",
        "action_items": "get_action_items_prompt",
        "faq": "get_faq_prompt",
        "quotes": "get_quotes_prompt",
        "examples": "get_examples_prompt",
        "code_snippets": "get_code_snippets_prompt",
        "study_guide": "get_study_guide_prompt",
    }
    return mapping.get(content_type)
