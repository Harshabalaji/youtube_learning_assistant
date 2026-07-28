"""
Vocabulary extraction prompt.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_vocabulary_prompt(transcript: str, title: str = "") -> list[dict]:
    """Extract difficult vocabulary with definitions and examples."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and extract important or difficult vocabulary.

Requirements:
- Extract 10-20 vocabulary words or terms
- Include technical terms, jargon, and advanced vocabulary
- Provide clear, concise definitions
- Include an example sentence showing usage
- Note the context where the word appeared in the video
- Prioritize terms that are essential for understanding the content

{context}

Respond with JSON in this exact format:
{{"words": [
    {{
        "word": "vocabulary word or term",
        "meaning": "Clear definition of the word/term",
        "example": "An example sentence using the word",
        "context": "How it was used in the video"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]
