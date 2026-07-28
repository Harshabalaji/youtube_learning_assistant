"""
Whisper transcription service — fallback when YouTube transcript is unavailable.
Downloads audio and transcribes using OpenAI Whisper.
"""

import os
import tempfile
from pathlib import Path
from typing import Optional, Dict

from core.config import settings
from core.logging_config import get_logger

logger = get_logger(__name__)


async def transcribe_with_whisper(video_id: str) -> Optional[Dict]:
    """
    Download audio from YouTube and transcribe using OpenAI Whisper.

    Args:
        video_id: The YouTube video ID.

    Returns:
        Dict with 'text', 'segments', and 'language', or None on failure.
    """
    audio_dir = Path(settings.AUDIO_DOWNLOAD_DIR)
    audio_dir.mkdir(parents=True, exist_ok=True)
    audio_path = audio_dir / f"{video_id}.mp3"

    try:
        # Step 1: Download audio using yt-dlp
        logger.info("Downloading audio for video: {}", video_id)
        await _download_audio(video_id, str(audio_path))

        if not audio_path.exists():
            logger.error("Audio file not found after download: {}", audio_path)
            return None

        # Step 2: Transcribe with Whisper
        logger.info("Transcribing audio with Whisper (model: {})", settings.WHISPER_MODEL)
        result = await _run_whisper(str(audio_path))

        if result is None:
            return None

        logger.info(
            "Whisper transcription complete: {} chars",
            len(result.get("text", "")),
        )

        return {
            "text": result["text"],
            "segments": result.get("segments", []),
            "language": result.get("language", "en"),
            "source": "whisper",
        }

    except Exception as e:
        logger.error("Whisper transcription failed for {}: {}", video_id, str(e))
        return None

    finally:
        # Clean up audio file
        if audio_path.exists():
            try:
                os.remove(audio_path)
                logger.debug("Cleaned up audio file: {}", audio_path)
            except Exception:
                pass


async def _download_audio(video_id: str, output_path: str):
    """Download audio from YouTube using yt-dlp."""
    import subprocess
    import asyncio

    url = f"https://www.youtube.com/watch?v={video_id}"
    cmd = [
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "-o", output_path,
        "--no-playlist",
        "--quiet",
        url,
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        error_msg = stderr.decode() if stderr else "Unknown error"
        logger.error("yt-dlp failed: {}", error_msg)
        raise RuntimeError(f"Audio download failed: {error_msg}")


async def _run_whisper(audio_path: str) -> Optional[Dict]:
    """Run Whisper transcription on an audio file."""
    import asyncio

    def _transcribe():
        import whisper

        model = whisper.load_model(settings.WHISPER_MODEL)
        result = model.transcribe(audio_path)

        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": seg.get("start", 0),
                "duration": seg.get("end", 0) - seg.get("start", 0),
                "text": seg.get("text", "").strip(),
            })

        return {
            "text": result.get("text", ""),
            "segments": segments,
            "language": result.get("language", "en"),
        }

    # Run in executor to avoid blocking
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _transcribe)
