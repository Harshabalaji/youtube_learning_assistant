"use client";

import { useState, use, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Loader2, MessageSquare, Download, AlertTriangle,
  CheckCircle2, Youtube, Brain, FileText, Sparkles, BookOpen,
  Layers, HelpCircle, Network, Clock, Briefcase, CheckSquare,
  Book, Lightbulb, Zap, ChevronRight,
} from "lucide-react";
import { useVideoContent, useAnalysisStatus } from "@/hooks/useAnalysis";
import { Sidebar, type TabType } from "@/components/sidebar";
import { VideoInfo } from "@/components/video-info";
import { SummaryView } from "@/components/summary-view";
import { TranscriptView } from "@/components/transcript-view";
import { NotesView } from "@/components/notes-view";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { QuizView } from "@/components/quiz-view";
import { MindMapView } from "@/components/mindmap-view";
import { TimelineView } from "@/components/timeline-view";
import { VocabularyView } from "@/components/vocabulary-view";
import { InterviewQuestions } from "@/components/interview-questions";
import { StudyGuideView } from "@/components/study-guide-view";
import { ChatPanel } from "@/components/chat-panel";
import { ExportMenu } from "@/components/export-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

// ── Pipeline stages ───────────────────────────────────────────────
const PIPELINE_STAGES = [
  { icon: Youtube,      label: "Fetching video metadata",        emoji: "🎬", cumEnd: 5   },
  { icon: FileText,     label: "Extracting transcript",           emoji: "📄", cumEnd: 15  },
  { icon: Brain,        label: "Chunking & embedding content",    emoji: "🧠", cumEnd: 35  },
  { icon: Sparkles,     label: "Generating all study materials",  emoji: "✨", cumEnd: 9999 },
];

// ── Study tips shown while waiting ─────────────────────────────────
const STUDY_TIPS = [
  { tip: "The Feynman Technique: explain a concept in simple words to truly understand it", icon: "💡" },
  { tip: "Spaced repetition beats cramming — review flashcards over 3 days, not 3 hours", icon: "📅" },
  { tip: "Active recall (quiz yourself) is 2× more effective than re-reading notes", icon: "🧠" },
  { tip: "The 50/10 rule: study for 50 minutes, then take a 10-minute break", icon: "⏰" },
  { tip: "Writing notes by hand (or typing from scratch) improves retention by 40%", icon: "✍️" },
  { tip: "Connect new ideas to things you already know — your brain loves patterns", icon: "🔗" },
  { tip: "Sleep is when your brain consolidates memories — don't skip it before exams", icon: "😴" },
];

// ── Processing Screen Component ───────────────────────────────────
function ProcessingScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        // Update current stage
        let stg = 0;
        for (let i = 0; i < PIPELINE_STAGES.length; i++) {
          if (next < PIPELINE_STAGES[i].cumEnd) { stg = i; break; }
          stg = i;
        }
        setStageIndex(stg);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Cycle study tips every 6s
  useEffect(() => {
    const t = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
        setTipVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Progress bar — caps at 95% until real completion
  const progressPercent = Math.min((elapsed / 90) * 100, 95);
  const currentTip = STUDY_TIPS[tipIndex];

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 hero-mesh pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-lg">

        {/* Animated brain orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute w-32 h-32 rounded-full border-2 border-violet-500/20 animate-spin-slow" />
          <div className="absolute w-44 h-44 rounded-full border border-violet-500/10 animate-counter-spin" />
          {/* Pulsing halo */}
          <div className="absolute w-24 h-24 rounded-full bg-violet-500/15 blur-xl animate-pulse" />
          {/* Core */}
          <div className="relative w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-pulse-glow">
            <Brain className="w-9 h-9 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-foreground font-display">Generating your study kit</h2>
          <p className="text-muted-foreground text-sm">
            AI is reading, chunking, and building everything in parallel…
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-mono font-bold text-foreground">{formatTime(elapsed)}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="progress-bar-fill h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right text-xs text-muted-foreground">{Math.round(progressPercent)}%</div>
        </div>

        {/* Stage steps */}
        <div className="w-full space-y-2.5">
          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isDone = i < stageIndex;
            const isActive = i === stageIndex;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${
                  isDone ? "step-done" : isActive ? "step-active" : "step-pending"
                }`}
              >
                <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                  {isDone ? (
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-semibold">{stage.label}</span>
                {isDone && <span className="ml-auto text-xs font-bold opacity-70">Done</span>}
                {isActive && <span className="ml-auto text-xs font-bold animate-pulse">Running…</span>}
              </div>
            );
          })}
        </div>

        {/* Rotating study tip */}
        <div
          className={`w-full glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-start gap-3 transition-all duration-400 ${
            tipVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="w-8 h-8 rounded-lg feature-amber border shrink-0 flex items-center justify-center text-base">
            {currentTip.icon}
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Study tip while you wait</div>
            <p className="text-sm text-foreground leading-relaxed">{currentTip.tip}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Usually 60–90 seconds · This tab will update automatically
        </p>
      </div>
    </div>
  );
}

// ── Tab pill config (color + label) ────────────────────────────────
const TAB_CONFIG: Record<string, { label: string; pillClass: string }> = {
  summary:       { label: "Summaries",       pillClass: "bg-violet-500/15 border-violet-500/30 text-violet-400" },
  transcript:    { label: "Transcript",       pillClass: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" },
  notes:         { label: "Structured Notes", pillClass: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
  flashcards:    { label: "Flashcards",       pillClass: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" },
  quiz:          { label: "Interactive Quiz", pillClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" },
  mindmap:       { label: "Mind Map",         pillClass: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
  timeline:      { label: "Timeline",         pillClass: "bg-rose-500/15 border-rose-500/30 text-rose-400" },
  vocabulary:    { label: "Vocabulary",        pillClass: "bg-pink-500/15 border-pink-500/30 text-pink-400" },
  interview:     { label: "Interview Prep",   pillClass: "bg-orange-500/15 border-orange-500/30 text-orange-400" },
  "study-guide": { label: "Study Guide",      pillClass: "bg-purple-500/15 border-purple-500/30 text-purple-400" },
  "action-items":{ label: "Action Items",     pillClass: "bg-teal-500/15 border-teal-500/30 text-teal-400" },
  chat:          { label: "RAG AI Chat",       pillClass: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
};

// ── Main Dashboard Page ───────────────────────────────────────────
export default function DashboardPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const resolvedParams = use(params);
  const videoId = resolvedParams.videoId;

  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  // Poll status every 3s while processing
  const { data: statusData } = useAnalysisStatus(videoId);
  const currentStatus = (statusData as any)?.status ?? "processing";
  const isProcessing = currentStatus === "processing";
  const isFailed = currentStatus === "failed";

  // Animate content in on tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setContentKey((k) => k + 1);
  }, []);

  // Only fetch full content once analysis is complete
  const { data: contentData, isLoading: contentLoading, error } = useVideoContent(
    videoId,
    currentStatus === "completed"
  );

  // ── Processing screen ──────────────────────────────────────────
  if (isProcessing) {
    return <ProcessingScreen />;
  }

  // ── Failed screen ──────────────────────────────────────────────
  if (isFailed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="relative w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center animate-bounce-in">
          <AlertTriangle className="w-9 h-9" />
        </div>
        <div className="space-y-2 max-w-md relative">
          <h3 className="font-black text-xl text-foreground">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {(statusData as any)?.error_message ||
              "Could not analyze this video. The transcript may be unavailable or the video is private."}
          </p>
        </div>
        <Button asChild variant="default" className="relative">
          <Link href="/" className="gap-2 flex items-center">
            <ArrowLeft className="w-4 h-4" />
            Try Another Video
          </Link>
        </Button>
      </div>
    );
  }

  // ── Content loading ────────────────────────────────────────────
  if (contentLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your study materials…</p>
      </div>
    );
  }

  // ── Content error ──────────────────────────────────────────────
  if (error || !contentData?.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="relative w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center animate-bounce-in">
          <AlertTriangle className="w-9 h-9" />
        </div>
        <div className="space-y-2 max-w-md relative">
          <h3 className="font-black text-xl text-foreground">Could Not Load Content</h3>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.response?.data?.detail ||
              "Could not load analysis for this video. Please check the URL and try again."}
          </p>
        </div>
        <Button asChild variant="default" className="relative">
          <Link href="/" className="gap-2 flex items-center">
            <ArrowLeft className="w-4 h-4" />
            Try Another Video
          </Link>
        </Button>
      </div>
    );
  }

  const analysis = contentData.data;
  const video = analysis.video;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-xl px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>

            {/* Color-matched active tab pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                TAB_CONFIG[activeTab]?.pillClass ?? "bg-primary/10 border-primary/20 text-primary"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{TAB_CONFIG[activeTab]?.label ?? activeTab.replace("-", " ")}</span>
            </div>

            {/* Thumbnail + title */}
            <div className="hidden md:flex items-center gap-2 min-w-0">
              {video.thumbnail_url && (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/40 shrink-0 shadow-sm">
                  <Image
                    src={video.thumbnail_url}
                    alt=""
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              )}
              <h1 className="font-bold text-sm text-foreground truncate max-w-xs font-display">
                {video.title || "Video Analysis"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportMenu videoId={videoId} />
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Top Video Header */}
          <VideoInfo video={video} />

          {/* Active Tab View — with slide-in animation on tab change */}
          <div key={contentKey} className="animate-fade-up pt-1">
            {activeTab === "summary" && (
              <SummaryView
                executiveSummary={analysis.executive_summary}
                detailedSummary={analysis.detailed_summary}
                chapterSummary={analysis.chapter_summary}
                keyTakeaways={analysis.key_takeaways}
              />
            )}

            {activeTab === "transcript" && (
              <TranscriptView
                transcript={analysis.transcript}
                videoUrl={video.url}
              />
            )}

            {activeTab === "notes" && (
              <NotesView notes={analysis.notes} />
            )}

            {activeTab === "flashcards" && (
              <FlashcardDeck
                flashcards={
                  analysis.flashcards?.flashcards ||
                  (Array.isArray(analysis.flashcards) ? analysis.flashcards : [])
                }
              />
            )}

            {activeTab === "quiz" && (
              <QuizView
                questions={
                  analysis.quiz?.questions ||
                  (Array.isArray(analysis.quiz) ? analysis.quiz : [])
                }
              />
            )}

            {activeTab === "mindmap" && (
              <MindMapView mindmap={analysis.mindmap} />
            )}

            {activeTab === "timeline" && (
              <TimelineView timeline={analysis.timeline} />
            )}

            {activeTab === "vocabulary" && (
              <VocabularyView vocabulary={analysis.vocabulary} />
            )}

            {activeTab === "interview" && (
              <InterviewQuestions interview={analysis.interview_questions} />
            )}

            {activeTab === "study-guide" && (
              <StudyGuideView studyGuide={analysis.study_guide} />
            )}

            {activeTab === "action-items" && (
              <div className="glass-card p-6 space-y-4 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl feature-indigo border flex items-center justify-center">
                    <CheckSquare className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-black text-xl text-foreground">Action Items</h3>
                </div>
                <div className="space-y-2.5">
                  {analysis.action_items?.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-accent/30 border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 animate-fade-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg shrink-0 ${
                        item.priority === "high"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-sm font-medium text-foreground">{item.action}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 ml-auto shrink-0" />
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm text-center py-6">No action items found for this video.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="max-w-4xl mx-auto">
                <ChatPanel videoId={videoId} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
