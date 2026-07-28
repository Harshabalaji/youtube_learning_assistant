"""
Structured notes generation prompt.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_notes_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate structured, markdown-formatted notes."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and create comprehensive, structured study notes.

Requirements:
- Use clear headings and subheadings (markdown ##, ###)
- Include bullet points and numbered lists
- Highlight key terms in **bold**
- Use > blockquotes for important quotes or definitions
- Add code blocks if technical content is discussed
- Include diagrams descriptions where helpful
- Organize logically by topic, not chronologically
- Be thorough — capture all important information
- Include a brief introduction and conclusion

{context}

Respond with JSON in this exact format:
{{
    "title": "Notes: Video Title",
    "sections": [
        {{
            "heading": "Section Title",
            "content": "Markdown content for this section",
            "subsections": [
                {{
                    "heading": "Subsection Title",
                    "content": "Subsection content",
                    "subsections": []
                }}
            ]
        }}
    ],
    "markdown": "Complete notes as a single markdown string"
}}
{JSON_INSTRUCTION}""",
        },
    ]
