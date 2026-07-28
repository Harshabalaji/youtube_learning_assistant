"""
Fallback Content Generator — generates structured study materials directly from transcript text
when an LLM provider is unavailable, unconfigured, or encounters an API error.
"""

import re
from typing import Dict, Any, List

def _split_into_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 10]

def generate_fallback_content(content_type: str, transcript: str, title: str = "") -> Dict[str, Any]:
    """
    Generate fallback content based on transcript text for a given content_type.
    Matches exact frontend component prop requirements.
    """
    sentences = _split_into_sentences(transcript)
    if not sentences:
        sentences = [transcript[:200]] if transcript else ["No transcript content available."]

    main_title = title or "Video Learning Content"

    if content_type == "executive_summary":
        summary_text = " ".join(sentences[:min(5, len(sentences))])
        return {
            "summary": summary_text,
            "word_count": len(summary_text.split()),
        }

    elif content_type == "detailed_summary":
        part_size = max(1, len(sentences) // 3)
        p1 = " ".join(sentences[:part_size])
        p2 = " ".join(sentences[part_size:part_size * 2])
        p3 = " ".join(sentences[part_size * 2:])
        markdown = (
            f"# {main_title} — Detailed Summary\n\n"
            f"## 1. Overview & Context\n{p1}\n\n"
            f"## 2. Main Technical Insights\n{p2}\n\n"
            f"## 3. Summary & Practical Application\n{p3}\n"
        )
        return {
            "summary": markdown,
            "word_count": len(markdown.split()),
        }

    elif content_type == "chapter_summary":
        num_chapters = min(4, max(2, len(sentences) // 4))
        chunk_len = len(sentences) // num_chapters
        chapters = []
        for i in range(num_chapters):
            start_idx = i * chunk_len
            end_idx = (i + 1) * chunk_len if i < num_chapters - 1 else len(sentences)
            chap_sentences = sentences[start_idx:end_idx]
            first_sent = chap_sentences[0] if chap_sentences else "Section Overview"
            chap_title = first_sent[:45] + "..." if len(first_sent) > 45 else first_sent
            
            minutes = (i * 3)
            start_time = f"{minutes:02d}:00"
            
            chapters.append({
                "title": f"Chapter {i+1}: {chap_title}",
                "start_time": start_time,
                "summary": " ".join(chap_sentences[:3]),
                "key_points": chap_sentences[:4],
            })
        return {"chapters": chapters}

    elif content_type == "key_takeaways":
        takeaways = sentences[::max(1, len(sentences) // 6)][:5]
        if not takeaways:
            takeaways = [transcript[:150]]
        return {"takeaways": takeaways}

    elif content_type == "notes":
        part_size = max(1, len(sentences) // 3)
        p1_bullets = "\n".join([f"- {s}" for s in sentences[:part_size][:4]])
        p2_bullets = "\n".join([f"- {s}" for s in sentences[part_size:part_size * 2][:4]])
        p3_bullets = "\n".join([f"- {s}" for s in sentences[part_size * 2:][:4]])
        
        markdown_content = (
            f"# {main_title}\n\n"
            f"## 1. Key Concepts & Core Ideas\n{p1_bullets}\n\n"
            f"## 2. In-Depth Analysis\n{p2_bullets}\n\n"
            f"## 3. Practical Applications & Summary\n{p3_bullets}\n"
        )
        return {
            "title": main_title,
            "markdown": markdown_content,
            "sections": [
                {
                    "heading": "1. Key Concepts & Core Ideas",
                    "bullet_points": sentences[:part_size][:4],
                    "subsections": []
                },
                {
                    "heading": "2. In-Depth Analysis",
                    "bullet_points": sentences[part_size:part_size * 2][:4],
                    "subsections": []
                },
                {
                    "heading": "3. Practical Applications & Summary",
                    "bullet_points": sentences[part_size * 2:][:4],
                    "subsections": []
                }
            ],
            "summary": " ".join(sentences[:3])
        }

    elif content_type == "flashcards":
        flashcards = []
        key_sentences = sentences[::max(1, len(sentences) // 6)][:6]
        for idx, sent in enumerate(key_sentences):
            words = sent.split()
            concept = " ".join(words[:4]) if len(words) >= 4 else f"Concept {idx+1}"
            flashcards.append({
                "id": idx + 1,
                "question": f"What is explained regarding '{concept}'?",
                "answer": sent,
                "difficulty": "medium" if idx % 2 == 0 else "easy",
                "category": "Key Points",
                "is_bookmarked": 0,
            })
        return {"flashcards": flashcards}

    elif content_type == "quiz":
        questions = []
        key_sentences = sentences[::max(1, len(sentences) // 5)][:5]
        for idx, sent in enumerate(key_sentences):
            words = sent.split()
            subject = " ".join(words[:3]) if len(words) >= 3 else "the topic"
            questions.append({
                "id": idx + 1,
                "question": f"According to the video, what statement best describes {subject}?",
                "options": [
                    sent,
                    f"Option B: {subject} is not related to this lesson.",
                    f"Option C: An alternative perspective on {subject}.",
                    f"Option D: None of the choices are correct."
                ],
                "correct_answer": 0,
                "explanation": f"The transcript specifically states: '{sent}'",
                "difficulty": "medium",
                "category": "General Comprehension",
            })
        return {"questions": questions}

    elif content_type == "mindmap":
        key_sentences = sentences[::max(1, len(sentences) // 4)][:4]
        mermaid_code = (
            f"graph TD\n"
            f'  Root["{main_title[:30]}"]\n'
        )
        for i, sent in enumerate(key_sentences):
            node_id = f"Node{i+1}"
            label = sent[:35].replace('"', "'")
            mermaid_code += f'  Root --> {node_id}["{label}..."]\n'
            
        return {
            "central_topic": main_title,
            "mermaid_code": mermaid_code
        }

    elif content_type == "vocabulary":
        words_found = list(set([w.strip('.,!?()[]') for w in transcript.split() if len(w) > 6]))[:6]
        words_list = []
        for word in words_found:
            matching = [s for s in sentences if word.lower() in s.lower()]
            ctx = matching[0] if matching else transcript[:100]
            words_list.append({
                "word": word.capitalize(),
                "meaning": f"Core term used in context: '{ctx[:100]}...'",
                "example": f"Sentence: {ctx[:120]}",
                "context": ctx[:150],
            })
        return {"words": words_list}

    elif content_type == "interview_questions":
        questions = []
        key_sents = sentences[::max(1, len(sentences) // 5)][:5]
        for idx, sent in enumerate(key_sents):
            questions.append({
                "question": f"How would you explain: '{sent[:50]}...'?",
                "suggested_answer": sent,
                "answer": sent,
                "type": "conceptual",
                "difficulty": "medium" if idx % 2 == 0 else "hard",
                "category": "Core Concept",
            })
        return {"questions": questions}

    elif content_type == "study_guide":
        num_sections = min(3, max(1, len(sentences) // 3))
        chunk_len = len(sentences) // num_sections
        sections = []
        for i in range(num_sections):
            start_idx = i * chunk_len
            end_idx = (i + 1) * chunk_len if i < num_sections - 1 else len(sentences)
            chap_sents = sentences[start_idx:end_idx]
            sections.append({
                "title": f"Module {i+1}: Concept Mastery",
                "content": " ".join(chap_sents[:3]),
                "key_concepts": [s[:30] for s in chap_sents[:3]],
                "review_questions": [f"Explain the main point: {s[:40]}?" for s in chap_sents[:2]],
            })
        return {
            "title": f"Study Guide: {main_title}",
            "overview": " ".join(sentences[:3]),
            "estimated_study_time": "15-20 mins",
            "sections": sections,
        }

    elif content_type == "timeline":
        events = []
        num_items = min(5, len(sentences))
        for i in range(num_items):
            min_mark = i * 2
            events.append({
                "time": f"{min_mark:02d}:00",
                "timestamp": f"{min_mark:02d}:00",
                "title": f"Key Highlight #{i+1}",
                "event": f"Key Highlight #{i+1}",
                "description": sentences[i],
            })
        return {"events": events}

    elif content_type == "action_items":
        items = []
        for i, sent in enumerate(sentences[:4]):
            items.append({
                "action": f"Review & Apply: {sent[:80]}",
                "priority": "high" if i % 2 == 0 else "medium",
            })
        return {"items": items}

    elif content_type == "faq":
        faqs = []
        for sent in sentences[:4]:
            faqs.append({
                "question": f"What is discussed regarding {sent[:40]}...?",
                "answer": sent,
            })
        return {"faqs": faqs}

    elif content_type == "quotes":
        quotes = [{"quote": s, "speaker": "Presenter"} for s in sentences[:3]]
        return {"quotes": quotes}

    elif content_type == "examples":
        examples = [
            {"title": f"Example {i+1}", "description": s}
            for i, s in enumerate(sentences[:3])
        ]
        return {"examples": examples}

    elif content_type == "code_snippets":
        return {"snippets": []}

    # Default fallback dict
    return {
        "summary": " ".join(sentences[:4]),
        "content": sentences[:5]
    }
