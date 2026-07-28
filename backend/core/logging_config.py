"""
Structured logging configuration using loguru.
Provides consistent, formatted log output for the application.
"""

import sys
from pathlib import Path

from loguru import logger

from core.config import settings, BASE_DIR

# Remove default loguru handler
logger.remove()

# Log directory
LOG_DIR = BASE_DIR / "data" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Console handler with colorized output
logger.add(
    sys.stdout,
    level="DEBUG" if settings.DEBUG else "INFO",
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    ),
    colorize=True,
)

# File handler with rotation
logger.add(
    str(LOG_DIR / "app_{time:YYYY-MM-DD}.log"),
    level="DEBUG",
    format=(
        "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
        "{name}:{function}:{line} | {message}"
    ),
    rotation="10 MB",
    retention="7 days",
    compression="zip",
)

# Error-specific log file
logger.add(
    str(LOG_DIR / "errors_{time:YYYY-MM-DD}.log"),
    level="ERROR",
    format=(
        "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
        "{name}:{function}:{line} | {message}\n{exception}"
    ),
    rotation="10 MB",
    retention="30 days",
    compression="zip",
)


def get_logger(name: str = __name__):
    """Get a contextualized logger instance."""
    return logger.bind(module=name)
