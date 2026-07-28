"""
YouTube URL parsing and validation utilities.
"""

import re
from typing import Optional
from urllib.parse import urlparse, parse_qs


# Valid YouTube URL patterns
YOUTUBE_PATTERNS = [
    r"(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([\w-]{11})",
    r"(?:https?://)?youtu\.be/([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/embed/([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/v/([\w-]{11})",
]


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract the YouTube video ID from various URL formats.

    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID

    Args:
        url: The YouTube URL.

    Returns:
        Video ID string (11 characters) or None if invalid.
    """
    url = url.strip()

    for pattern in YOUTUBE_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    # Fallback: try parsing as URL and extracting 'v' parameter
    try:
        parsed = urlparse(url)
        if "youtube.com" in parsed.netloc:
            params = parse_qs(parsed.query)
            if "v" in params:
                video_id = params["v"][0]
                if len(video_id) == 11:
                    return video_id
    except Exception:
        pass

    return None


def is_valid_youtube_url(url: str) -> bool:
    """Check if a URL is a valid YouTube video URL."""
    return extract_video_id(url) is not None


def normalize_youtube_url(url: str) -> Optional[str]:
    """
    Normalize a YouTube URL to the standard format.

    Args:
        url: Any YouTube URL format.

    Returns:
        Normalized URL like https://www.youtube.com/watch?v=VIDEO_ID
    """
    video_id = extract_video_id(url)
    if video_id:
        return f"https://www.youtube.com/watch?v={video_id}"
    return None


def get_thumbnail_url(video_id: str, quality: str = "maxresdefault") -> str:
    """
    Get the thumbnail URL for a YouTube video.

    Args:
        video_id: The YouTube video ID.
        quality: Thumbnail quality ('maxresdefault', 'hqdefault', 'mqdefault', 'sddefault').

    Returns:
        Thumbnail URL string.
    """
    return f"https://img.youtube.com/vi/{video_id}/{quality}.jpg"


def format_duration(seconds: int) -> str:
    """
    Format duration in seconds to a readable string.

    Args:
        seconds: Duration in seconds.

    Returns:
        Formatted string like "1h 23m 45s".
    """
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes}m {secs}s"
    else:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours}h {minutes}m {secs}s"
