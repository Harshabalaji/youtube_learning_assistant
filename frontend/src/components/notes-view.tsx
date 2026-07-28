"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Download, FileCode, Printer } from "lucide-react";
import type { StructuredNotes } from "@/types";
import { Button } from "@/components/ui/button";

interface NotesViewProps {
  notes?: StructuredNotes;
}

export function NotesView({ notes }: NotesViewProps) {
  const [copied, setCopied] = useState(false);

  const markdownContent =
    notes?.markdown ||
    (typeof notes === "string" ? notes : "") ||
    (notes?.sections
      ? notes.sections
          .map(
            (s: any) =>
              `## ${s.heading || s.title || "Section"}\n` +
              (s.bullet_points || []).map((b: any) => `- ${b}`).join("\n")
          )
          .join("\n\n")
      : "") ||
    notes?.summary ||
    "";

  const handleCopy = () => {
    if (!markdownContent) return;
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!markdownContent) return;
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${notes?.title || "study_notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!notes || !markdownContent) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No notes available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between glass-card p-4">
        <h3 className="font-bold text-base text-foreground truncate">
          {notes.title || "Structured Notes"}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown</span>
              </>
            )}
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </Button>
        </div>
      </div>

      {/* Markdown Render Card */}
      <div className="glass-card p-8">
        <div className="prose-custom dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
