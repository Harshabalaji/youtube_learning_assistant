"""
Flashcard generation prompt.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_flashcards_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate flashcards with question, answer, difficulty, and category."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and create educational flashcards.

Requirements:
- Generate 15-25 flashcards
- Mix of difficulty levels: easy (30%), medium (50%), hard (20%)
- Cover all major topics discussed
- Questions should test understanding, not just recall
- Answers should be concise but complete (1-3 sentences)
- Assign a relevant category to each flashcard
- Include both factual and conceptual questions

{context}

Respond with JSON in this exact format:
{{"flashcards": [
    {{
        "question": "What is the question?",
        "answer": "The answer explanation",
        "difficulty": "easy|medium|hard",
        "category": "Topic Category"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]
