/**
 * TypeScript interfaces for the YouTube Learning Assistant.
 */

// ── Video ──────────────────────────────────────────────────────

export interface VideoMetadata {
  id: number;
  video_id: string;
  url: string;
  title: string | null;
  channel: string | null;
  duration: number | null;
  thumbnail_url: string | null;
  description: string | null;
  view_count: number | null;
  publish_date: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  word_count: number | null;
  reading_time_minutes: number | null;
  reading_level: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface TranscriptData {
  cleaned_text: string;
  source: string;
  language: string;
  segments: TranscriptSegment[] | null;
}

// ── Generated Content ──────────────────────────────────────────

export interface ExecutiveSummary {
  summary: string;
  word_count: number;
}

export interface DetailedSummary {
  summary: string;
  word_count: number;
}

export interface ChapterSummary {
  title: string;
  summary: string;
  start_time?: string;
  key_points: string[];
}

export interface KeyTakeaways {
  takeaways: string[];
}

export interface StructuredNotes {
  title: string;
  sections: NotesSection[];
  markdown: string;
}

export interface NotesSection {
  heading: string;
  content: string;
  subsections: NotesSection[];
}

export interface Flashcard {
  id?: number;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  category: string | null;
  is_bookmarked: boolean;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
  category: string | null;
}

export interface InterviewQuestion {
  question: string;
  suggested_answer: string;
  difficulty: "easy" | "medium" | "hard";
  category: string | null;
}

export interface VocabularyWord {
  word: string;
  meaning: string;
  example: string;
  context?: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

export interface MindMapData {
  mermaid_code: string;
  central_topic: string;
}

export interface ActionItem {
  action: string;
  priority: "low" | "medium" | "high";
  category?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ImportantQuote {
  quote: string;
  context?: string;
  timestamp?: string;
}

export interface RealWorldExample {
  title: string;
  description: string;
  relevance: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description: string;
  timestamp?: string;
}

export interface StudyGuideSection {
  title: string;
  content: string;
  key_concepts: string[];
  review_questions: string[];
}

export interface StudyGuide {
  title: string;
  overview: string;
  sections: StudyGuideSection[];
  suggested_reading: string[];
  estimated_study_time?: string;
}

// ── Complete Analysis ──────────────────────────────────────────

export interface VideoAnalysis {
  video: VideoMetadata;
  transcript?: TranscriptData;
  executive_summary?: ExecutiveSummary;
  detailed_summary?: DetailedSummary;
  chapter_summary?: { chapters: ChapterSummary[] };
  key_takeaways?: KeyTakeaways;
  notes?: StructuredNotes;
  flashcards?: { flashcards: Flashcard[] };
  quiz?: { questions: QuizQuestion[] };
  interview_questions?: { questions: InterviewQuestion[] };
  vocabulary?: { words: VocabularyWord[] };
  timeline?: { events: TimelineEvent[] };
  mindmap?: MindMapData;
  action_items?: { items: ActionItem[] };
  faq?: { faqs: FAQItem[] };
  quotes?: { quotes: ImportantQuote[] };
  examples?: { examples: RealWorldExample[] };
  code_snippets?: { snippets: CodeSnippet[] };
  study_guide?: StudyGuide;
}

// ── Chat ───────────────────────────────────────────────────────

export interface SourceChunk {
  text: string;
  relevance_score: number | null;
  chunk_index?: number;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  message_count: number;
}

// ── API ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AnalyzeRequest {
  url: string;
  llm_provider?: string;
  model?: string;
}

export interface ChatRequest {
  video_id: string;
  message: string;
  session_id?: number;
  llm_provider?: string;
  model?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  time_taken_seconds: number;
  results: {
    question: string;
    options: string[];
    user_answer: number;
    correct_answer: number;
    is_correct: boolean;
    explanation: string | null;
  }[];
}

// ── LLM Providers ──────────────────────────────────────────────

export interface LLMProvider {
  name: string;
  models: string[];
  available: boolean;
  base_url?: string;
}

export interface ProvidersResponse {
  providers: Record<string, LLMProvider>;
  default: string;
}

// ── User ───────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  preferred_llm_provider: string;
  preferred_model: string;
}
