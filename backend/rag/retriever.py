"""
RAG retriever — retrieves relevant context chunks and generates answers.
"""

from typing import List, Optional

from core.logging_config import get_logger
from llm.factory import get_llm_provider
from prompts.chat import get_chat_prompt
from rag.vectorstore import search_similar

logger = get_logger(__name__)


async def retrieve_and_answer(
    video_id: str,
    question: str,
    chat_history: Optional[List[dict]] = None,
    provider: str = None,
    model: str = None,
    n_results: int = 5,
) -> dict:
    """
    Retrieve relevant chunks and generate an answer using RAG.

    Args:
        video_id: The YouTube video ID.
        question: The user's question.
        chat_history: Previous conversation messages.
        provider: LLM provider to use.
        model: Specific model to use.
        n_results: Number of context chunks to retrieve.

    Returns:
        Dict with 'answer', 'sources', and metadata.
    """
    logger.info("RAG query for video {}: '{}'", video_id, question[:100])

    # Step 1: Retrieve relevant chunks from ChromaDB
    search_results = search_similar(video_id, question, n_results=n_results)

    context_chunks = []
    sources = []

    if search_results["documents"] and search_results["documents"][0]:
        for i, doc in enumerate(search_results["documents"][0]):
            context_chunks.append(doc)
            distance = (
                search_results["distances"][0][i]
                if search_results.get("distances")
                else None
            )
            metadata = (
                search_results["metadatas"][0][i]
                if search_results.get("metadatas")
                else {}
            )
            sources.append({
                "text": doc[:300] + "..." if len(doc) > 300 else doc,
                "relevance_score": round(1 - distance, 4) if distance else None,
                "chunk_index": metadata.get("chunk_index"),
            })

    logger.info("Retrieved {} context chunks", len(context_chunks))

    # Step 2: Build the prompt with context
    messages = get_chat_prompt(
        question=question,
        context_chunks=context_chunks,
        chat_history=chat_history,
    )

    # Step 3: Generate answer
    try:
        llm = get_llm_provider(provider=provider, model=model)
        answer = await llm.generate(messages, json_mode=False)
    except Exception as e:
        logger.warning("LLM answer generation failed in retriever: {}. Using context fallback.", str(e))
        if context_chunks:
            answer = f"Based on the video transcript:\n\n" + "\n\n".join(context_chunks[:2])
        else:
            answer = "I'm sorry, I couldn't process your question at this moment."

    return {
        "answer": answer,
        "sources": sources,
        "chunks_retrieved": len(context_chunks),
    }


async def retrieve_and_stream(
    video_id: str,
    question: str,
    chat_history: Optional[List[dict]] = None,
    provider: str = None,
    model: str = None,
    n_results: int = 5,
):
    """
    Retrieve relevant chunks and stream the answer.

    Yields:
        Text chunks as they are generated, plus a final sources object.
    """
    logger.info("RAG streaming query for video {}: '{}'", video_id, question[:100])

    # Step 1: Retrieve
    search_results = search_similar(video_id, question, n_results=n_results)

    context_chunks = []
    sources = []

    if search_results["documents"] and search_results["documents"][0]:
        for i, doc in enumerate(search_results["documents"][0]):
            context_chunks.append(doc)
            distance = (
                search_results["distances"][0][i]
                if search_results.get("distances")
                else None
            )
            sources.append({
                "text": doc[:300] + "..." if len(doc) > 300 else doc,
                "relevance_score": round(1 - distance, 4) if distance else None,
            })

    # Step 2: Build prompt
    messages = get_chat_prompt(
        question=question,
        context_chunks=context_chunks,
        chat_history=chat_history,
    )

    # Step 3: Stream answer
    llm = get_llm_provider(provider=provider, model=model)
    async for chunk in llm.generate_stream(messages):
        yield {"type": "content", "data": chunk}

    # Yield sources at the end
    yield {"type": "sources", "data": sources}
