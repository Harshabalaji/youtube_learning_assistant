"use client";

import { useState, useMemo } from "react";
import { Search, Copy, Check, Clock, Globe, FileText, Download } from "lucide-react";
import type { TranscriptData } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TranscriptViewProps {
  transcript?: TranscriptData;
  videoUrl?: string;
}

export function TranscriptView({ transcript, videoUrl }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!transcript?.cleaned_text) return;
    navigator.clipboard.writeText(transcript.cleaned_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSegments = useMemo(() => {
    if (!transcript?.segments) return [];
    if (!searchQuery.trim()) return transcript.segments;

    const query = searchQuery.toLowerCase();
    return transcript.segments.filter((seg) =>
      seg.text.toLowerCase().includes(query)
    );
  }, [transcript?.segments, searchQuery]);

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!transcript) {
    return (
      <div className="p-8 text-center text-muted-foreground glass-card">
        No transcript data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          {searchQuery && (
            <span className="text-xs text-muted-foreground shrink-0">
              {filteredSegments.length} matches
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Badge variant="outline" className="gap-1">
            <Globe className="w-3 h-3" />
            <span>{transcript.language?.toUpperCase() || "EN"}</span>
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="w-3 h-3" />
            <span>Source: {transcript.source}</span>
          </Badge>
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
                <span>Copy All</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Segments View or Full Text */}
      <div className="glass-card p-6 max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
        {transcript.segments && transcript.segments.length > 0 ? (
          filteredSegments.length > 0 ? (
            filteredSegments.map((segment, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition duration-150 group"
              >
                <a
                  href={`${videoUrl}&t=${Math.floor(segment.start)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md shrink-0 transition"
                  title="Jump to video timestamp"
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(segment.start)}</span>
                </a>

                <p className="text-sm leading-relaxed text-foreground flex-1">
                  {segment.text}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No matching sentences found for "{searchQuery}"
            </div>
          )
        ) : (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
            {transcript.cleaned_text}
          </div>
        )}
      </div>
    </div>
  );
}
