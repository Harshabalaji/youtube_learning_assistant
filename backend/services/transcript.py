"""
Transcript processing service — cleaning and preparation.
"""

from core.logging_config import get_logger
from utils.text_processing import clean_transcript, count_words, estimate_reading_time

logger = get_logger(__name__)


def process_transcript(raw_text: str) -> dict:
    """
    Process a raw transcript: clean, analyze, and prepare for use.

    Args:
        raw_text: The raw transcript text.

    Returns:
        Dict with cleaned text and metadata.
    """
    # Clean the transcript
    cleaned = clean_transcript(raw_text)

    # Calculate stats
    word_count = count_words(cleaned)
    reading_time = estimate_reading_time(cleaned)

    logger.info(
        "Processed transcript: {} words, ~{} min reading time",
        word_count,
        reading_time,
    )

    return {
        "cleaned_text": cleaned,
        "word_count": word_count,
        "reading_time_minutes": reading_time,
    }
