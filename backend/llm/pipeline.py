"""
AI Generation Pipeline — orchestrates all content generation from a transcript.
Runs each generation task and collects results.
"""

import asyncio
import time
from typing import Optional

from core.logging_config import get_logger
from llm.factory import get_llm_provider
from llm.fallback import generate_fallback_content
from llm.providers import BaseLLMProvider
from prompts.summary import (
    get_executive_summary_prompt,
    get_detailed_summary_prompt,
    get_chapter_summary_prompt,
    get_key_takeaways_prompt,
)
from prompts.notes import get_notes_prompt
from prompts.flashcards import get_flashcards_prompt
from prompts.quiz import get_quiz_prompt
from prompts.mindmap import get_mindmap_prompt
from prompts.vocabulary import get_vocabulary_prompt
from prompts.interview import get_interview_prompt
from prompts.study_guide import (
    get_study_guide_prompt,
    get_timeline_prompt,
    get_action_items_prompt,
    get_faq_prompt,
    get_quotes_prompt,
    get_examples_prompt,
    get_code_snippets_prompt,
)

logger = get_logger(__name__)

# Map content types to their prompt generator functions
CONTENT_GENERATORS = {
    "executive_summary": get_executive_summary_prompt,
    "detailed_summary": get_detailed_summary_prompt,
    "chapter_summary": get_chapter_summary_prompt,
    "key_takeaways": get_key_takeaways_prompt,
    "notes": get_notes_prompt,
    "flashcards": get_flashcards_prompt,
    "quiz": get_quiz_prompt,
    "mindmap": get_mindmap_prompt,
    "vocabulary": get_vocabulary_prompt,
    "interview_questions": get_interview_prompt,
    "study_guide": get_study_guide_prompt,
    "timeline": get_timeline_prompt,
    "action_items": get_action_items_prompt,
    "faq": get_faq_prompt,
    "quotes": get_quotes_prompt,
    "examples": get_examples_prompt,
    "code_snippets": get_code_snippets_prompt,
}


async def generate_single_content(
    llm: BaseLLMProvider,
    content_type: str,
    transcript: str,
    title: str = "",
) -> dict:
    """
    Generate a single content type using the LLM.

    Args:
        llm: The LLM provider instance.
        content_type: Type of content to generate (e.g., 'executive_summary').
        transcript: The cleaned transcript text.
        title: The video title for context.

    Returns:
        Dict with the generated content and metadata.
    """
    prompt_fn = CONTENT_GENERATORS.get(content_type)
    if not prompt_fn:
        raise ValueError(f"Unknown content type: {content_type}")

    logger.info("Generating content type: {}", content_type)
    start_time = time.time()

    try:
        messages = prompt_fn(transcript, title)
        response = await llm.generate(messages, json_mode=True)
        parsed = llm.parse_json_response(response)
        elapsed = time.time() - start_time

        logger.info(
            "Generated {} in {:.2f}s", content_type, elapsed
        )

        return {
            "content_type": content_type,
            "content": parsed,
            "generation_time_seconds": round(elapsed, 2),
            "success": True,
        }

    except Exception as e:
        elapsed = time.time() - start_time
        logger.warning(
            "LLM generation failed for {}: {} ({:.2f}s). Using rule-based fallback generator...",
            content_type,
            str(e),
            elapsed,
        )
        try:
            fallback_data = generate_fallback_content(content_type, transcript, title)
            return {
                "content_type": content_type,
                "content": fallback_data,
                "generation_time_seconds": round(elapsed, 2),
                "success": True,
                "is_fallback": True,
            }
        except Exception as fb_err:
            logger.error("Fallback generation failed for {}: {}", content_type, str(fb_err))
            return {
                "content_type": content_type,
                "content": None,
                "generation_time_seconds": round(elapsed, 2),
                "success": False,
                "error": str(e),
            }


async def run_full_pipeline(
    transcript: str,
    title: str = "",
    provider: str = None,
    model: str = None,
    content_types: list[str] = None,
    max_concurrent: int = 1,
    inter_request_delay: float = 2.0,
) -> dict[str, dict]:
    """
    Run the full AI generation pipeline for all content types.

    Runs sequentially with delays between calls to respect API rate limits
    (e.g. Gemini free tier: 5 requests/minute).

    Args:
        transcript: The cleaned transcript text.
        title: The video title.
        provider: LLM provider name.
        model: Specific model to use.
        content_types: Optional list of specific content types to generate.
                       If None, generates all types.
        max_concurrent: Maximum number of concurrent LLM calls.
        inter_request_delay: Seconds to wait between LLM calls (rate limiting).

    Returns:
        Dict mapping content type names to their generated content.
    """
    llm = get_llm_provider(provider=provider, model=model)

    # Determine which content types to generate
    types_to_generate = content_types or list(CONTENT_GENERATORS.keys())

    logger.info(
        "Starting AI pipeline with {} content types using {} / {}",
        len(types_to_generate),
        provider or "default",
        model or "default",
    )

    results = {}

    # Run sequentially with delay to respect rate limits
    for i, content_type in enumerate(types_to_generate):
        result = await generate_single_content(llm, content_type, transcript, title)
        if isinstance(result, dict):
            results[result["content_type"]] = result

        # Add delay between requests to avoid rate limiting (skip after last)
        if i < len(types_to_generate) - 1 and inter_request_delay > 0:
            await asyncio.sleep(inter_request_delay)

    successful = sum(1 for r in results.values() if r.get("success"))
    total = len(results)
    logger.info(
        "Pipeline complete: {}/{} content types generated successfully",
        successful,
        total,
    )

    return results
