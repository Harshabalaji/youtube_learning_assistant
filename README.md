# YouTube Learning Assistant — Comprehensive Documentation

# YouTube Learning Assistant 🎓🤖

An enterprise-grade, full-stack AI platform that transforms any YouTube video into an interactive study suite. Built with Next.js 15, FastAPI, LangChain, ChromaDB, and multi-LLM support (OpenAI, Gemini, Ollama).

---

## 🌟 Key Features

1. **Automated Transcript Extraction**
   - Direct extraction via `youtube-transcript-api`.
   - Automatic fallback to OpenAI Whisper audio transcription if disabled.
   - Text cleaning, noise reduction, and timestamp alignment.

2. **16 AI Study Material Outputs**
   - **Executive Summary** (100–150 words)
   - **Detailed Summary** (1000+ words in markdown)
   - **Chapter-wise Breakdown** with auto-detected topics
   - **Core Key Takeaways**
   - **Structured Study Notes**
   - **3D Flip Flashcards** (Difficulty tagged, bookmarks)
   - **20 MCQ Quizzes** (Timer, explanations, scoring, review mode)
   - **Interview Prep Q&A** (Easy, Medium, Hard with revealable answers)
   - **Concept Mind Maps** (Interactive Mermaid diagram rendering)
   - **Chronological Timeline**
   - **Vocabulary Dictionary**
   - **Complete Study Guide**
   - **Action Items, FAQ, Important Quotes, Real-World Examples, Code Snippets**

3. **RAG AI Chatbot**
   - Vector search powered by ChromaDB & BAAI/bge-small-en embeddings.
   - Contextual citation sources with match percentages.
   - Streaming SSE responses.

4. **Multi-Format Export**
   - Download complete material as **PDF**, **DOCX**, or **Markdown (.md)**.

5. **Multi-LLM Provider Support**
   - Switch effortlessly between **OpenAI (GPT-4.1 / GPT-4o)**, **Google Gemini (2.5 Flash)**, and **Ollama (Llama 3 / Mistral)**.

---

## 🏗️ Architecture

```
[ Frontend: Next.js 15 + TypeScript + TailwindCSS ]
                       │
                       ▼ (HTTP API / Rewrites)
[ Backend: FastAPI (Python 3.11) ]
       │               │                │
       ▼               ▼                ▼
 [ SQLAlchemy ]  [ LangChain ]    [ ChromaDB ]
  (SQLite/Pg)     (LLM Engine)   (Vector Store)
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- OpenAI or Gemini API Key (or Ollama running locally)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY or GOOGLE_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To run both backend and frontend via Docker Compose:

```bash
docker-compose up --build
```

---

## 📡 API Reference

- `POST /api/analyze` — Start video analysis
- `GET /api/video/{video_id}` — Get all generated content
- `POST /api/chat` — RAG chatbot query
- `POST /api/quiz/{video_id}/submit` — Submit quiz answers
- `GET /api/export/{video_id}/{format}` — Download PDF, DOCX, or Markdown
- `GET /api/providers` — List available AI engines

---

## 📜 License

MIT License. Built for production excellence.
