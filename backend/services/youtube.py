"""
YouTube service — handles URL validation, metadata fetching, and transcript retrieval.
"""

import re
from typing import Optional, Dict, List

import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)

from core.logging_config import get_logger
from utils.youtube_helpers import extract_video_id, get_thumbnail_url

logger = get_logger(__name__)

# Create a reusable API instance
_ytt_api = YouTubeTranscriptApi()


async def fetch_video_metadata(video_id: str) -> Dict:
    """
    Fetch video metadata using the oembed API (no API key required).

    Args:
        video_id: The YouTube video ID.

    Returns:
        Dict with video metadata.
    """
    metadata = {
        "video_id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "thumbnail_url": get_thumbnail_url(video_id),
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Use oembed API for basic metadata
            oembed_url = (
                f"https://www.youtube.com/oembed"
                f"?url=https://www.youtube.com/watch?v={video_id}&format=json"
            )
            response = await client.get(oembed_url)
            if response.status_code == 200:
                data = response.json()
                metadata["title"] = data.get("title", "Untitled Video")
                metadata["channel"] = data.get("author_name", "Unknown Channel")
                metadata["thumbnail_url"] = data.get("thumbnail_url", metadata["thumbnail_url"])

            # Try to get additional info from the page
            page_url = f"https://www.youtube.com/watch?v={video_id}"
            page_response = await client.get(page_url)
            if page_response.status_code == 200:
                page_text = page_response.text

                # Extract duration from page meta
                duration_match = re.search(r'"lengthSeconds":"(\d+)"', page_text)
                if duration_match:
                    metadata["duration"] = int(duration_match.group(1))

                # Extract view count
                views_match = re.search(r'"viewCount":"(\d+)"', page_text)
                if views_match:
                    metadata["view_count"] = int(views_match.group(1))

                # Extract publish date
                date_match = re.search(r'"publishDate":"(\d{4}-\d{2}-\d{2})"', page_text)
                if date_match:
                    metadata["publish_date"] = date_match.group(1)

                # Extract description (first 500 chars)
                desc_match = re.search(r'"shortDescription":"(.*?)"', page_text)
                if desc_match:
                    desc = desc_match.group(1)[:500]
                    # Unescape
                    desc = desc.replace("\\n", "\n").replace('\\"', '"')
                    metadata["description"] = desc

    except Exception as e:
        logger.warning("Failed to fetch full metadata for {}: {}", video_id, str(e))

    return metadata


def fetch_transcript(video_id: str) -> Optional[Dict]:
    """
    Fetch the transcript for a YouTube video.

    Uses api.fetch() as the primary approach (auto-selects best transcript),
    with a fallback to listing and manually selecting transcripts.

    Args:
        video_id: The YouTube video ID.

    Returns:
        Dict with 'text' (full transcript), 'segments' (timestamped), and 'language'.
        None if transcript is unavailable.
    """
    language = "en"

    # Primary approach: use fetch() directly — it auto-selects the best transcript
    try:
        logger.info("Attempting direct fetch for video: {}", video_id)
        transcript_data = _ytt_api.fetch(video_id)
        return _parse_transcript_data(transcript_data, video_id, language)
    except Exception as e:
        logger.warning(
            "Direct fetch failed for {}: {} ({}). Trying list approach...",
            video_id, type(e).__name__, str(e)
        )

    # Fallback: list transcripts and try to find one manually
    try:
        logger.info("Listing available transcripts for video: {}", video_id)
        transcript_list = _ytt_api.list(video_id)

        # Log what's available
        available = []
        for t in transcript_list:
            available.append(f"{t.language_code} ({'manual' if not t.is_generated else 'auto'})")
        logger.info("Available transcripts for {}: {}", video_id, ", ".join(available) if available else "none")

        # Re-list since we consumed the iterator
        transcript_list = _ytt_api.list(video_id)

        transcript = None
        # Prefer manual English
        try:
            transcript = transcript_list.find_manually_created_transcript(["en"])
            logger.info("Found manual English transcript")
        except Exception:
            pass

        if transcript is None:
            transcript_list = _ytt_api.list(video_id)
            try:
                transcript = transcript_list.find_generated_transcript(["en"])
                logger.info("Found auto-generated English transcript")
            except Exception:
                pass

        # Last resort: any transcript at all
        if transcript is None:
            transcript_list = _ytt_api.list(video_id)
            for t in transcript_list:
                transcript = t
                language = t.language_code
                logger.info("Using fallback transcript: {} ({})", t.language_code, "auto" if t.is_generated else "manual")
                break

        if transcript is None:
            logger.warning("No transcript found for video: {}", video_id)
            return None

        transcript_data = transcript.fetch()
        return _parse_transcript_data(transcript_data, video_id, language)

    except TranscriptsDisabled:
        logger.warning("Transcripts are disabled for video: {}", video_id)
        return None
    except NoTranscriptFound:
        logger.warning("No transcript found for video: {}", video_id)
        return None
    except VideoUnavailable:
        logger.error("Video unavailable: {}", video_id)
        return None
    except Exception as e:
        logger.error("Error fetching transcript for {}: {} ({})", video_id, type(e).__name__, str(e))
        return None


def _parse_transcript_data(transcript_data, video_id: str, language: str = "en") -> Optional[Dict]:
    """Parse transcript data object into our standard dict format."""
    segments = []
    full_text_parts = []

    for entry in transcript_data.to_raw_data():
        text = entry.get("text", "").strip()
        if text:
            full_text_parts.append(text)
            segments.append({
                "start": entry.get("start", 0),
                "duration": entry.get("duration", 0),
                "text": text,
            })

    full_text = " ".join(full_text_parts)

    if not full_text.strip():
        logger.warning("Transcript was empty after parsing for video: {}", video_id)
        return None

    logger.info(
        "Fetched transcript for {} ({} segments, {} chars)",
        video_id,
        len(segments),
        len(full_text),
    )

    return {
        "text": full_text,
        "segments": segments,
        "language": language,
        "source": "youtube",
    }

