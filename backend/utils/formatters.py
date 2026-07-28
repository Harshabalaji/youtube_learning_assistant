"""
Output formatting helpers for export and display.
"""

from typing import List, Dict, Any, Optional


def format_flashcards_markdown(flashcards: List[Dict]) -> str:
    """Format flashcards as markdown."""
    lines = ["# Flashcards\n"]
    for i, card in enumerate(flashcards, 1):
        difficulty = card.get("difficulty", "medium").upper()
        lines.append(f"## Card {i} [{difficulty}]")
        if card.get("category"):
            lines.append(f"*Category: {card['category']}*\n")
        lines.append(f"**Q:** {card['question']}\n")
        lines.append(f"**A:** {card['answer']}\n")
        lines.append("---\n")
    return "\n".join(lines)


def format_quiz_markdown(questions: List[Dict]) -> str:
    """Format quiz questions as markdown."""
    lines = ["# Quiz\n"]
    for i, q in enumerate(questions, 1):
        lines.append(f"## Question {i}")
        if q.get("difficulty"):
            lines.append(f"*Difficulty: {q['difficulty']}*\n")
        lines.append(f"**{q['question']}**\n")
        options = q.get("options", [])
        for j, opt in enumerate(options):
            prefix = "ABCD"[j] if j < 4 else str(j + 1)
            lines.append(f"- ({prefix}) {opt}")
        correct = q.get("correct_answer", 0)
        if isinstance(correct, int) and correct < len(options):
            lines.append(f"\n✅ **Correct Answer:** ({('ABCD')[correct]}) {options[correct]}")
        if q.get("explanation"):
            lines.append(f"\n💡 **Explanation:** {q['explanation']}")
        lines.append("\n---\n")
    return "\n".join(lines)


def format_vocabulary_markdown(words: List[Dict]) -> str:
    """Format vocabulary list as markdown."""
    lines = ["# Vocabulary\n"]
    for word_entry in words:
        lines.append(f"### {word_entry['word']}")
        lines.append(f"**Definition:** {word_entry['meaning']}\n")
        lines.append(f"**Example:** *{word_entry['example']}*\n")
        if word_entry.get("context"):
            lines.append(f"**Context:** {word_entry['context']}\n")
        lines.append("---\n")
    return "\n".join(lines)


def format_timeline_markdown(events: List[Dict]) -> str:
    """Format timeline as markdown."""
    lines = ["# Timeline\n"]
    for event in events:
        lines.append(f"### 🕐 {event['time']}")
        lines.append(f"**{event['title']}**\n")
        lines.append(f"{event['description']}\n")
    return "\n".join(lines)


def format_interview_markdown(questions: List[Dict]) -> str:
    """Format interview questions as markdown."""
    lines = ["# Interview Questions\n"]

    for difficulty in ["easy", "medium", "hard"]:
        filtered = [q for q in questions if q.get("difficulty") == difficulty]
        if filtered:
            lines.append(f"## {difficulty.title()} Level\n")
            for i, q in enumerate(filtered, 1):
                lines.append(f"### Q{i}: {q['question']}")
                lines.append(f"\n**Suggested Answer:** {q['suggested_answer']}\n")
                lines.append("---\n")

    return "\n".join(lines)


def format_complete_study_material(content: Dict[str, Any], video_title: str = "") -> str:
    """
    Format all generated content into a single comprehensive markdown document.

    Args:
        content: Dict of content_type -> content data.
        video_title: The video title.

    Returns:
        Complete markdown string.
    """
    sections = []
    sections.append(f"# 📚 Study Material: {video_title}\n")
    sections.append("---\n")

    # Executive Summary
    if "executive_summary" in content:
        data = content["executive_summary"].get("content", {})
        sections.append("## 📋 Executive Summary\n")
        sections.append(data.get("summary", "") + "\n")

    # Key Takeaways
    if "key_takeaways" in content:
        data = content["key_takeaways"].get("content", {})
        sections.append("## 🎯 Key Takeaways\n")
        for takeaway in data.get("takeaways", []):
            sections.append(f"- {takeaway}")
        sections.append("")

    # Detailed Summary
    if "detailed_summary" in content:
        data = content["detailed_summary"].get("content", {})
        sections.append("## 📝 Detailed Summary\n")
        sections.append(data.get("summary", "") + "\n")

    # Chapter Summary
    if "chapter_summary" in content:
        data = content["chapter_summary"].get("content", {})
        sections.append("## 📖 Chapter-wise Summary\n")
        for chapter in data.get("chapters", []):
            sections.append(f"### {chapter['title']}")
            sections.append(chapter.get("summary", ""))
            if chapter.get("key_points"):
                for point in chapter["key_points"]:
                    sections.append(f"  - {point}")
            sections.append("")

    # Notes
    if "notes" in content:
        data = content["notes"].get("content", {})
        sections.append("## 📒 Notes\n")
        sections.append(data.get("markdown", "") + "\n")

    # Flashcards
    if "flashcards" in content:
        data = content["flashcards"].get("content", {})
        sections.append(format_flashcards_markdown(data.get("flashcards", [])))

    # Quiz
    if "quiz" in content:
        data = content["quiz"].get("content", {})
        sections.append(format_quiz_markdown(data.get("questions", [])))

    # Interview Questions
    if "interview_questions" in content:
        data = content["interview_questions"].get("content", {})
        sections.append(format_interview_markdown(data.get("questions", [])))

    # Vocabulary
    if "vocabulary" in content:
        data = content["vocabulary"].get("content", {})
        sections.append(format_vocabulary_markdown(data.get("words", [])))

    # Timeline
    if "timeline" in content:
        data = content["timeline"].get("content", {})
        sections.append(format_timeline_markdown(data.get("events", [])))

    # Action Items
    if "action_items" in content:
        data = content["action_items"].get("content", {})
        sections.append("## ✅ Action Items\n")
        for item in data.get("items", []):
            priority = item.get("priority", "medium").upper()
            sections.append(f"- [{priority}] {item['action']}")
        sections.append("")

    # FAQ
    if "faq" in content:
        data = content["faq"].get("content", {})
        sections.append("## ❓ FAQ\n")
        for faq in data.get("faqs", []):
            sections.append(f"**Q: {faq['question']}**\n")
            sections.append(f"A: {faq['answer']}\n")

    # Quotes
    if "quotes" in content:
        data = content["quotes"].get("content", {})
        sections.append("## 💬 Important Quotes\n")
        for quote in data.get("quotes", []):
            sections.append(f'> "{quote["quote"]}"')
            if quote.get("context"):
                sections.append(f"*{quote['context']}*\n")

    return "\n".join(sections)
