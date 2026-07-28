"""
Text chunking using LangChain text splitters.
Splits transcripts into overlapping chunks for embedding and retrieval.
"""

from typing import List, Dict, Optional

from langchain_text_splitters import RecursiveCharacterTextSplitter

from core.logging_config import get_logger

logger = get_logger(__name__)


def chunk_transcript(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[str]:
    """
    Split a transcript into overlapping chunks.

    Args:
        text: The transcript text to split.
        chunk_size: Maximum size of each chunk in characters.
        chunk_overlap: Number of overlapping characters between chunks.

    Returns:
        List of text chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", "? ", "! ", ", ", " ", ""],
        is_separator_regex=False,
    )

    chunks = splitter.split_text(text)
    logger.info(
        "Split transcript into {} chunks (size={}, overlap={})",
        len(chunks),
        chunk_size,
        chunk_overlap,
    )
    return chunks


def chunk_with_metadata(
    text: str,
    video_id: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> tuple[List[str], List[Dict]]:
    """
    Split a transcript into chunks with metadata for each chunk.

    Args:
        text: The transcript text to split.
        video_id: The YouTube video ID.
        chunk_size: Maximum size of each chunk in characters.
        chunk_overlap: Number of overlapping characters between chunks.

    Returns:
        Tuple of (chunks, metadatas).
    """
    chunks = chunk_transcript(text, chunk_size, chunk_overlap)

    metadatas = []
    for i, chunk in enumerate(chunks):
        metadatas.append({
            "chunk_index": i,
            "video_id": video_id,
            "char_start": max(0, i * (chunk_size - chunk_overlap)),
            "chunk_length": len(chunk),
            "word_count": len(chunk.split()),
        })

    return chunks, metadatas


def estimate_reading_level(text: str) -> str:
    """
    Estimate the reading level of text using basic heuristics.
    
    Uses a simplified Flesch-Kincaid approximation.
    """
    words = text.split()
    sentences = text.count(".") + text.count("!") + text.count("?")
    if sentences == 0:
        sentences = 1
    
    avg_sentence_length = len(words) / sentences
    
    # Simple syllable count approximation
    syllables = 0
    for word in words[:500]:  # Sample first 500 words
        word = word.lower().strip(".,!?;:")
        if len(word) <= 3:
            syllables += 1
        else:
            syllables += max(1, len([c for c in word if c in "aeiou"]))
    
    avg_syllables = syllables / max(1, min(len(words), 500))
    
    # Simplified grade level
    grade = 0.39 * avg_sentence_length + 11.8 * avg_syllables - 15.59
    
    if grade < 6:
        return "Elementary"
    elif grade < 9:
        return "Middle School"
    elif grade < 12:
        return "High School"
    elif grade < 16:
        return "College"
    else:
        return "Graduate"
