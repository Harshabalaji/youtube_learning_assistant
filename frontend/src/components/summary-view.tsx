"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CheckCircle2, List, FileText, Bookmark, Sparkles, BookOpen,
  ChevronDown, ChevronUp, Target,
} from "lucide-react";
import type {
  ExecutiveSummary,
  DetailedSummary,
  ChapterSummary,
  KeyTakeaways,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryViewProps {
  executiveSummary?: ExecutiveSummary;
  detailedSummary?: DetailedSummary;
  chapterSummary?: { chapters: ChapterSummary[] };
  keyTakeaways?: KeyTakeaways;
}

// ── Sub-tab config ────────────────────────────────────────────────
const SUB_TABS = [
  {
    id: "executive" as const,
    label: "Executive",
    sublabel: "100–150 words",
    icon: Sparkles,
    activeClass: "bg-violet-500 text-white shadow-md shadow-violet-500/30",
    iconClass: "text-violet-400",
  },
  {
    id: "takeaways" as const,
    label: "Key Takeaways",
    sublabel: "Must-knows",
    icon: CheckCircle2,
    activeClass: "bg-emerald-500 text-white shadow-md shadow-emerald-500/30",
    iconClass: "text-emerald-400",
  },
  {
    id: "chapters" as const,
    label: "Chapter-wise",
    sublabel: "Topic breakdown",
    icon: List,
    activeClass: "bg-indigo-500 text-white shadow-md shadow-indigo-500/30",
    iconClass: "text-indigo-400",
  },
  {
    id: "detailed" as const,
    label: "Detailed",
    sublabel: "1000+ words",
    icon: BookOpen,
    activeClass: "bg-blue-500 text-white shadow-md shadow-blue-500/30",
    iconClass: "text-blue-400",
  },
];

type SubTabId = (typeof SUB_TABS)[number]["id"];

// ── Collapsible chapter card ──────────────────────────────────────
function ChapterCard({ chapter, idx }: { chapter: ChapterSummary; idx: number }) {
  const [open, setOpen] = useState(idx === 0);

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-300 ${
        open ? "border-primary/20 shadow-lg shadow-primary/5" : ""
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-lg gradient-bg text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md shadow-purple-500/30">
            {idx + 1}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">{chapter.title}</p>
            {chapter.start_time && (
              <span className="text-[10px] text-muted-foreground font-mono">{chapter.start_time}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {chapter.key_points && chapter.key_points.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {chapter.key_points.length} points
            </span>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
          <p className="text-sm text-foreground/80 leading-relaxed">{chapter.summary}</p>
          {chapter.key_points && chapter.key_points.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Chapter Highlights
              </span>
              <ul className="space-y-1">
                {chapter.key_points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SummaryView({
  executiveSummary,
  detailedSummary,
  chapterSummary,
  keyTakeaways,
}: SummaryViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("executive");

  const activeTabConfig = SUB_TABS.find((t) => t.id === activeSubTab)!;

  return (
    <div className="space-y-5">
      {/* ── Sub Tab Switcher ──────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/40">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? tab.activeClass
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <div className="text-left leading-none">
                <div>{tab.label}</div>
                <div className={`text-[9px] font-normal mt-0.5 ${isActive ? "opacity-80" : "text-muted-foreground/60"}`}>
                  {tab.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Executive Summary ─────────────────────────── */}
      {activeSubTab === "executive" && (
        <Card className="glass-card border-violet-500/15 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-lg flex items-center gap-2 font-display">
              <div className="w-8 h-8 rounded-xl feature-violet border flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Executive Summary</span>
            </CardTitle>
            {executiveSummary?.word_count && (
              <Badge variant="outline" className="font-mono text-xs">
                {executiveSummary.word_count} words
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {/* Decorative quote mark */}
            <div className="relative">
              <span className="absolute -top-2 -left-1 text-6xl text-violet-500/10 font-black leading-none select-none">
                "
              </span>
              <p className="text-base leading-relaxed text-foreground/90 font-normal pl-4 relative z-10">
                {executiveSummary?.summary || "No executive summary available."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Key Takeaways ─────────────────────────────── */}
      {activeSubTab === "takeaways" && (
        <Card className="glass-card border-emerald-500/15 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="pt-4 pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-display">
              <div className="w-8 h-8 rounded-xl feature-emerald border flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span>Core Key Takeaways</span>
                {keyTakeaways?.takeaways && (
                  <Badge variant="outline" className="ml-2 text-xs font-mono">
                    {keyTakeaways.takeaways.length} insights
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {keyTakeaways?.takeaways?.map((takeaway, idx) => (
              <div
                key={idx}
                className="takeaway-card flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/8 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="w-6 h-6 rounded-full gradient-bg text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5 shadow-sm shadow-purple-500/30">
                  {idx + 1}
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {takeaway}
                </p>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm text-center py-6">
                No key takeaways available.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Chapter-wise ──────────────────────────────── */}
      {activeSubTab === "chapters" && (
        <div className="space-y-3">
          {/* Chapter count header */}
          {chapterSummary?.chapters && chapterSummary.chapters.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {chapterSummary.chapters.length} chapters detected
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                Click to expand
              </span>
            </div>
          )}
          {chapterSummary?.chapters?.map((chapter, idx) => (
            <ChapterCard key={idx} chapter={chapter} idx={idx} />
          )) || (
            <p className="text-muted-foreground text-sm text-center py-8">
              No chapter summary available.
            </p>
          )}
        </div>
      )}

      {/* ── Detailed Summary ──────────────────────────── */}
      {activeSubTab === "detailed" && (
        <Card className="glass-card border-blue-500/15 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-lg flex items-center gap-2 font-display">
              <div className="w-8 h-8 rounded-xl feature-blue border flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Comprehensive Summary</span>
            </CardTitle>
            {detailedSummary?.word_count && (
              <Badge variant="outline" className="font-mono text-xs">
                {detailedSummary.word_count} words
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose-custom dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {detailedSummary?.summary || "No detailed summary available."}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
