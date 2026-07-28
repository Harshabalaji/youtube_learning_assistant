"""
Summary generation prompts — Executive, Detailed, and Chapter-wise.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_executive_summary_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate an executive summary prompt (100-150 words)."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and generate an executive summary.

Requirements:
- Length: exactly 100-150 words
- Capture the core message, main arguments, and key conclusions
- Write in clear, professional language
- Include the most important insights

{context}

Respond with JSON in this exact format:
{{"summary": "your summary text here", "word_count": 125}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_detailed_summary_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate a detailed summary prompt (1000+ words)."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and generate a comprehensive detailed summary.

Requirements:
- Length: 1000-2000 words
- Cover all major topics and subtopics discussed
- Include specific details, data points, and examples mentioned
- Maintain logical flow and structure
- Use markdown formatting (headers, bullet points, bold text)
- Capture nuances and context the speaker provides

{context}

Respond with JSON in this exact format:
{{"summary": "your detailed markdown summary here", "word_count": 1200}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_chapter_summary_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate chapter-wise summary with auto-detected topics."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and break it into chapters/topics, then summarize each one.

Requirements:
- Automatically detect 3-8 distinct topics/chapters from the content
- Each chapter should have a descriptive title
- Provide a 100-200 word summary for each chapter
- List 2-4 key points per chapter
- Maintain chronological order

{context}

Respond with JSON in this exact format:
{{"chapters": [
    {{
        "title": "Chapter Title",
        "summary": "Chapter summary text",
        "start_time": "approximate timestamp or position",
        "key_points": ["point 1", "point 2", "point 3"]
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_key_takeaways_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate key takeaways as bullet points."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and extract the key takeaways.

Requirements:
- Extract 8-15 key takeaways
- Each takeaway should be a clear, actionable statement
- Prioritize by importance
- Be specific, avoid vague generalizations
- Include any statistics, frameworks, or methods mentioned

{context}

Respond with JSON in this exact format:
{{"takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]}}
{JSON_INSTRUCTION}""",
        },
    ]
