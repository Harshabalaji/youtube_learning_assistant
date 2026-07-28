"""
RAG Chat prompt for conversational Q&A about video content.
"""

from prompts.base import SYSTEM_ROLE


def get_chat_system_prompt() -> str:
    """System prompt for the RAG chatbot."""
    return """You are an intelligent video learning assistant. You answer questions about a YouTube video based on its transcript and context.

Rules:
1. Answer questions ONLY based on the provided context from the video transcript.
2. If the answer is not in the provided context, say so clearly.
3. Be concise but thorough in your answers.
4. When referencing specific parts of the video, mention the context.
5. Use markdown formatting for clear, readable responses.
6. If asked about code, format it properly in code blocks.
7. Always be helpful and educational in your tone."""


def get_chat_prompt(
    question: str,
    context_chunks: list[str],
    chat_history: list[dict] = None,
) -> list[dict]:
    """
    Build the chat prompt with RAG context.
    
    Args:
        question: The user's question.
        context_chunks: Retrieved context chunks from ChromaDB.
        chat_history: Previous messages in the conversation.
        
    Returns:
        List of message dicts for the LLM.
    """
    messages = [{"role": "system", "content": get_chat_system_prompt()}]

    # Add chat history (last 10 messages for context window management)
    if chat_history:
        for msg in chat_history[-10:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })

    # Build context from retrieved chunks
    context_text = "\n\n---\n\n".join(context_chunks) if context_chunks else "No relevant context found."

    # Add the user's question with context
    user_message = f"""Based on the following context from the video transcript, answer the question.

**Context from video:**
{context_text}

**Question:** {question}

Provide a clear, helpful answer based on the context above. If the context doesn't contain enough information to answer, say so."""

    messages.append({"role": "user", "content": user_message})

    return messages
