"""
Mind map generation prompt — returns Mermaid syntax.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_mindmap_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate a mind map in Mermaid syntax."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and create a mind map.

Requirements:
- Return valid Mermaid mindmap syntax
- Central node should be the main topic
- Include 4-7 main branches
- Each branch should have 2-4 sub-branches
- Keep labels concise (1-5 words each)
- Capture the hierarchical structure of the content
- Use the Mermaid mindmap syntax format

{context}

Respond with JSON in this exact format:
{{
    "mermaid_code": "mindmap\\n  root((Central Topic))\\n    Branch 1\\n      Sub-branch 1a\\n      Sub-branch 1b\\n    Branch 2\\n      Sub-branch 2a\\n      Sub-branch 2b",
    "central_topic": "The central topic name"
}}

IMPORTANT: Use \\n for newlines in the mermaid_code string. The mermaid code must be valid Mermaid mindmap syntax.
{JSON_INSTRUCTION}""",
        },
    ]
