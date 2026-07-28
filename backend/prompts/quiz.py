"""
Quiz generation prompt — MCQs with explanations.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_quiz_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate 20 MCQ quiz questions with options, correct answer, and explanation."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and create a comprehensive quiz.

Requirements:
- Generate exactly 20 multiple-choice questions
- Each question has exactly 4 options (A, B, C, D)
- Mix of difficulty: easy (5), medium (10), hard (5)
- Questions should test comprehension, application, and analysis
- Provide a clear explanation for the correct answer
- Assign relevant category to each question
- Options should be plausible — avoid obviously wrong answers
- Cover all major topics from the video

{context}

Respond with JSON in this exact format:
{{"questions": [
    {{
        "question": "The question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "Why this is the correct answer",
        "difficulty": "easy|medium|hard",
        "category": "Topic Category"
    }}
]}}

Note: correct_answer is a zero-based index (0=A, 1=B, 2=C, 3=D).
{JSON_INSTRUCTION}""",
        },
    ]
