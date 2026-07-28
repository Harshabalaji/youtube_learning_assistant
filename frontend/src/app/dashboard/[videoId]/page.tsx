"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageSquare, Download, AlertTriangle } from "lucide-react";
import { useVideoContent } from "@/hooks/useAnalysis";
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

export default function DashboardPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const resolvedParams = use(params);
  const videoId = resolvedParams.videoId;

  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  const { data: contentData, isLoading, error } = useVideoContent(videoId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg text-foreground">Processing Video</h3>
          <p className="text-xs text-muted-foreground">
            Transcribing, chunking, embedding in ChromaDB, and running AI pipeline...
          </p>
        </div>
      </div>
    );
  }

  if (error || !contentData?.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="font-bold text-lg text-foreground">Analysis Failed</h3>
          <p className="text-xs text-muted-foreground">
            {(error as any)?.response?.data?.detail ||
              "Could not load analysis for this video. Please check the URL and try again."}
          </p>
        </div>
        <Button asChild variant="default">
          <Link href="/">Try Another Video</Link>
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
        onTabChange={(tab) => setActiveTab(tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="font-bold text-sm text-foreground truncate max-w-md">
              {video.title || "Video Analysis"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ExportMenu videoId={videoId} />
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Top Video Header */}
          <VideoInfo video={video} />

          {/* Active Tab View */}
          <div className="pt-2">
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
                <h3 className="font-bold text-lg text-foreground">Action Items</h3>
                <div className="space-y-2">
                  {analysis.action_items?.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/40">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.priority === "high" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-sm font-medium text-foreground">{item.action}</span>
                    </div>
                  )) || <p className="text-muted-foreground">No action items found.</p>}
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
