"""
Embedding model setup using BAAI/bge-small-en via Sentence Transformers.
"""

from functools import lru_cache
from typing import List

from core.config import settings
from core.logging_config import get_logger

logger = get_logger(__name__)

# Global embedding model instance (lazy loaded)
_embedding_model = None


def get_embedding_model():
    """
    Get or initialize the sentence transformer embedding model.
    Uses lazy loading to avoid slow startup.
    """
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            logger.info(
                "Loading embedding model: {} on {}",
                settings.EMBEDDING_MODEL,
                settings.EMBEDDING_DEVICE,
            )
            _embedding_model = SentenceTransformer(
                settings.EMBEDDING_MODEL,
                device=settings.EMBEDDING_DEVICE,
            )
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error("Failed to load embedding model: {}", str(e))
            raise

    return _embedding_model


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of text strings.

    Args:
        texts: List of text strings to embed.

    Returns:
        List of embedding vectors (each a list of floats).
    """
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    return embeddings.tolist()


def generate_single_embedding(text: str) -> List[float]:
    """
    Generate an embedding for a single text string.

    Args:
        text: The text to embed.

    Returns:
        Embedding vector as a list of floats.
    """
    model = get_embedding_model()
    embedding = model.encode(
        text,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    return embedding.tolist()


class EmbeddingFunction:
    """
    ChromaDB-compatible embedding function wrapper.
    Implements the ChromaDB EmbeddingFunction interface.
    """

    def __call__(self, input: List[str]) -> List[List[float]]:
        """Generate embeddings for ChromaDB."""
        return generate_embeddings(input)
