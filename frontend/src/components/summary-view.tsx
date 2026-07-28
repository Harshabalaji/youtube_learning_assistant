"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, List, FileText, Bookmark, Sparkles, BookOpen } from "lucide-react";
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

export function SummaryView({
  executiveSummary,
  detailedSummary,
  chapterSummary,
  keyTakeaways,
}: SummaryViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "executive" | "detailed" | "chapters" | "takeaways"
  >("executive");

  return (
    <div className="space-y-6">
      {/* Sub Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50">
        <button
          onClick={() => setActiveSubTab("executive")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "executive"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Executive (100-150 words)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("takeaways")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "takeaways"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Key Takeaways</span>
        </button>

        <button
          onClick={() => setActiveSubTab("chapters")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "chapters"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Chapter-wise</span>
        </button>

        <button
          onClick={() => setActiveSubTab("detailed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "detailed"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Detailed Summary (1000+ words)</span>
        </button>
      </div>

      {/* Executive Summary */}
      {activeSubTab === "executive" && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Executive Summary</span>
            </CardTitle>
            {executiveSummary?.word_count && (
              <Badge variant="outline">{executiveSummary.word_count} words</Badge>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-foreground/90 font-normal">
              {executiveSummary?.summary || "No executive summary available."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Takeaways */}
      {activeSubTab === "takeaways" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Core Key Takeaways</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {keyTakeaways?.takeaways?.map((takeaway, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 border border-border/40 hover:bg-accent/60 transition"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {takeaway}
                </p>
              </div>
            )) || <p className="text-muted-foreground">No key takeaways available.</p>}
          </CardContent>
        </Card>
      )}

      {/* Chapter-wise */}
      {activeSubTab === "chapters" && (
        <div className="space-y-4">
          {chapterSummary?.chapters?.map((chapter, idx) => (
            <Card key={idx} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span>{chapter.title}</span>
                  </CardTitle>
                  {chapter.start_time && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {chapter.start_time}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {chapter.summary}
                </p>
                {chapter.key_points && chapter.key_points.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Chapter Highlights:
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-foreground/90">
                      {chapter.key_points.map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )) || <p className="text-muted-foreground">No chapter summary available.</p>}
        </div>
      )}

      {/* Detailed Summary */}
      {activeSubTab === "detailed" && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>Comprehensive Detailed Summary</span>
            </CardTitle>
            {detailedSummary?.word_count && (
              <Badge variant="outline">{detailedSummary.word_count} words</Badge>
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
