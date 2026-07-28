"""
Interview questions generation prompt.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_interview_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate interview questions at easy, medium, and hard difficulty."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and generate interview questions based on the content.

Requirements:
- Generate 15-20 interview questions total
- Distribution: 5 easy, 7-8 medium, 5 hard
- Easy: factual recall and basic understanding
- Medium: application and analysis
- Hard: synthesis, evaluation, and critical thinking
- Provide a suggested answer for each question
- Assign relevant categories
- Questions should be suitable for a job interview or academic assessment

{context}

Respond with JSON in this exact format:
{{"questions": [
    {{
        "question": "The interview question?",
        "suggested_answer": "A comprehensive suggested answer",
        "difficulty": "easy|medium|hard",
        "category": "Topic Category"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]
