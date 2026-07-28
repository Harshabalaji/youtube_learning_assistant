"""
Study guide, timeline, action items, FAQ, quotes, examples, and code snippets prompts.
"""

from prompts.base import SYSTEM_ROLE, JSON_INSTRUCTION, build_transcript_context


def get_study_guide_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate a complete study guide."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and create a comprehensive study guide.

Requirements:
- Include an overview of the material
- Break content into 4-8 study sections
- Each section should list key concepts and review questions
- Suggest additional reading/resources
- Estimate total study time
- Make it suitable for exam preparation

{context}

Respond with JSON in this exact format:
{{
    "title": "Study Guide: Topic Name",
    "overview": "Brief overview of what this guide covers",
    "sections": [
        {{
            "title": "Section Title",
            "content": "Detailed study content for this section",
            "key_concepts": ["concept 1", "concept 2"],
            "review_questions": ["question 1?", "question 2?"]
        }}
    ],
    "suggested_reading": ["Resource 1", "Resource 2"],
    "estimated_study_time": "2-3 hours"
}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_timeline_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate a chronological timeline of events/topics."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and create a chronological timeline.

Requirements:
- Create 6-12 timeline events
- Each event should have a time reference (either from the video or logical order)
- Include a title and description for each event
- Maintain chronological order
- Capture the progression of ideas/topics

{context}

Respond with JSON in this exact format:
{{"events": [
    {{
        "time": "0:00 - Introduction" or "Step 1",
        "title": "Event Title",
        "description": "What was discussed at this point"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_action_items_prompt(transcript: str, title: str = "") -> list[dict]:
    """Extract actionable items from the content."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and extract action items.

Requirements:
- Extract 5-15 actionable items
- Each item should be specific and actionable
- Assign priority: low, medium, or high
- Assign a category
- Include both explicit actions mentioned and implied actions

{context}

Respond with JSON in this exact format:
{{"items": [
    {{
        "action": "Specific action to take",
        "priority": "low|medium|high",
        "category": "Category"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_faq_prompt(transcript: str, title: str = "") -> list[dict]:
    """Generate FAQ from the content."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and generate a FAQ (Frequently Asked Questions).

Requirements:
- Generate 8-15 questions and answers
- Questions should be ones a viewer might naturally ask
- Answers should be comprehensive but concise
- Cover both basic and advanced topics
- Include questions about concepts that might be confusing

{context}

Respond with JSON in this exact format:
{{"faqs": [
    {{
        "question": "A frequently asked question?",
        "answer": "The comprehensive answer"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_quotes_prompt(transcript: str, title: str = "") -> list[dict]:
    """Extract important quotes from the content."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and extract the most important quotes.

Requirements:
- Extract 5-10 significant quotes
- Include the context for each quote
- Prioritize insightful, memorable, or impactful statements
- If exact quotes aren't available, paraphrase key statements

{context}

Respond with JSON in this exact format:
{{"quotes": [
    {{
        "quote": "The exact or paraphrased quote",
        "context": "Why this quote is significant",
        "timestamp": "approximate timestamp if available"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_examples_prompt(transcript: str, title: str = "") -> list[dict]:
    """Extract real-world examples mentioned in the content."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript and extract real-world examples.

Requirements:
- Extract 5-10 real-world examples, case studies, or practical applications
- Include a title, description, and relevance for each
- If the video discusses abstract concepts, create relevant examples

{context}

Respond with JSON in this exact format:
{{"examples": [
    {{
        "title": "Example Title",
        "description": "Detailed description of the example",
        "relevance": "Why this example is relevant to the topic"
    }}
]}}
{JSON_INSTRUCTION}""",
        },
    ]


def get_code_snippets_prompt(transcript: str, title: str = "") -> list[dict]:
    """Extract or generate code snippets if coding-related content."""
    context = build_transcript_context(transcript, title)
    return [
        {"role": "system", "content": SYSTEM_ROLE},
        {
            "role": "user",
            "content": f"""Analyze the following video transcript. If it discusses programming, coding, or technical implementation, extract or recreate code snippets.

Requirements:
- Extract code that was discussed or shown
- If code was described but not shown, create representative examples
- Include the programming language
- Add a description for each snippet
- If the video is NOT coding-related, return an empty snippets list

{context}

Respond with JSON in this exact format:
{{"snippets": [
    {{
        "language": "python",
        "code": "def example():\\n    return 'hello'",
        "description": "Description of what this code does",
        "timestamp": "approximate timestamp if available"
    }}
]}}

If no coding content exists, return: {{"snippets": []}}
{JSON_INSTRUCTION}""",
        },
    ]
