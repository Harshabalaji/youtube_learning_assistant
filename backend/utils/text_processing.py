"""
Text processing and cleaning utilities.
"""

import re
from typing import List


def clean_transcript(text: str) -> str:
    """
    Clean a raw transcript by removing noise and formatting issues.

    Operations:
    - Remove excessive whitespace
    - Remove filler words artifacts
    - Fix punctuation spacing
    - Remove speaker labels if present
    - Normalize line breaks

    Args:
        text: Raw transcript text.

    Returns:
        Cleaned transcript text.
    """
    if not text:
        return ""

    cleaned = text

    # Remove common YouTube auto-caption artifacts
    cleaned = re.sub(r"\[Music\]", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\[Applause\]", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\[Laughter\]", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\[inaudible\]", "", cleaned, flags=re.IGNORECASE)

    # Remove timestamp artifacts like [00:00:00]
    cleaned = re.sub(r"\[\d{1,2}:\d{2}(:\d{2})?\]", "", cleaned)

    # Remove excessive newlines (more than 2 consecutive)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    # Remove excessive spaces
    cleaned = re.sub(r"  +", " ", cleaned)

    # Fix spacing around punctuation
    cleaned = re.sub(r"\s+([.,!?;:])", r"\1", cleaned)
    cleaned = re.sub(r"([.,!?;:])(?=[A-Za-z])", r"\1 ", cleaned)

    # Remove leading/trailing whitespace on each line
    lines = [line.strip() for line in cleaned.split("\n")]
    cleaned = "\n".join(lines)

    # Remove empty lines at start/end
    cleaned = cleaned.strip()

    return cleaned


def count_words(text: str) -> int:
    """Count the number of words in a text."""
    return len(text.split())


def estimate_reading_time(text: str, wpm: int = 200) -> float:
    """
    Estimate reading time in minutes.

    Args:
        text: The text to estimate.
        wpm: Words per minute (default 200).

    Returns:
        Estimated reading time in minutes.
    """
    words = count_words(text)
    return round(words / wpm, 1)


def truncate_text(text: str, max_length: int = 500, suffix: str = "...") -> str:
    """Truncate text to max_length, adding suffix if truncated."""
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)] + suffix


def extract_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def remove_urls(text: str) -> str:
    """Remove URLs from text."""
    return re.sub(r"https?://\S+", "", text)


def normalize_whitespace(text: str) -> str:
    """Normalize all whitespace to single spaces."""
    return " ".join(text.split())
