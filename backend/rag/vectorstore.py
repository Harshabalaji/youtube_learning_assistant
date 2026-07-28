"""
ChromaDB vector store integration.
Handles collection management, document storage, and similarity search.
"""

from typing import List, Optional, Dict
from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings

from core.config import settings
from core.logging_config import get_logger
from rag.embeddings import EmbeddingFunction

logger = get_logger(__name__)

# Global ChromaDB client (lazy loaded)
_chroma_client = None


def get_chroma_client() -> chromadb.ClientAPI:
    """Get or initialize the ChromaDB persistent client."""
    global _chroma_client
    if _chroma_client is None:
        persist_dir = Path(settings.CHROMA_PERSIST_DIR)
        persist_dir.mkdir(parents=True, exist_ok=True)

        logger.info("Initializing ChromaDB at: {}", persist_dir)
        _chroma_client = chromadb.PersistentClient(
            path=str(persist_dir),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        logger.info("ChromaDB initialized successfully")

    return _chroma_client


def get_collection_name(video_id: str) -> str:
    """Generate a collection name for a specific video."""
    return f"{settings.CHROMA_COLLECTION_PREFIX}_{video_id}"


def get_or_create_collection(video_id: str):
    """
    Get or create a ChromaDB collection for a video.

    Args:
        video_id: The YouTube video ID.

    Returns:
        ChromaDB collection.
    """
    client = get_chroma_client()
    collection_name = get_collection_name(video_id)
    embedding_fn = EmbeddingFunction()

    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )
    logger.info(
        "Collection '{}' ready ({}  documents)",
        collection_name,
        collection.count(),
    )
    return collection


def store_chunks(
    video_id: str,
    chunks: List[str],
    metadatas: Optional[List[Dict]] = None,
) -> int:
    """
    Store text chunks in ChromaDB for a video.

    Args:
        video_id: The YouTube video ID.
        chunks: List of text chunks to store.
        metadatas: Optional metadata for each chunk.

    Returns:
        Number of chunks stored.
    """
    if not chunks:
        logger.warning("No chunks to store for video: {}", video_id)
        return 0

    collection = get_or_create_collection(video_id)

    # Generate unique IDs for each chunk
    ids = [f"{video_id}_chunk_{i}" for i in range(len(chunks))]

    # Default metadata if not provided
    if metadatas is None:
        metadatas = [{"chunk_index": i, "video_id": video_id} for i in range(len(chunks))]

    # ChromaDB has a batch limit — add in batches of 100
    batch_size = 100
    for start in range(0, len(chunks), batch_size):
        end = min(start + batch_size, len(chunks))
        collection.add(
            ids=ids[start:end],
            documents=chunks[start:end],
            metadatas=metadatas[start:end],
        )

    logger.info("Stored {} chunks for video: {}", len(chunks), video_id)
    return len(chunks)


def search_similar(
    video_id: str,
    query: str,
    n_results: int = 5,
) -> Dict:
    """
    Search for similar chunks in a video's collection.

    Args:
        video_id: The YouTube video ID.
        query: The search query.
        n_results: Number of results to return.

    Returns:
        Dict with documents, distances, and metadatas.
    """
    collection = get_or_create_collection(video_id)

    if collection.count() == 0:
        logger.warning("Collection for video {} is empty", video_id)
        return {"documents": [[]], "distances": [[]], "metadatas": [[]]}

    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, collection.count()),
    )

    logger.info(
        "Search returned {} results for query: '{}'",
        len(results["documents"][0]) if results["documents"] else 0,
        query[:50],
    )
    return results


def delete_collection(video_id: str) -> bool:
    """
    Delete a video's collection from ChromaDB.

    Args:
        video_id: The YouTube video ID.

    Returns:
        True if deleted, False if not found.
    """
    client = get_chroma_client()
    collection_name = get_collection_name(video_id)

    try:
        client.delete_collection(collection_name)
        logger.info("Deleted collection: {}", collection_name)
        return True
    except Exception:
        logger.warning("Collection not found: {}", collection_name)
        return False
