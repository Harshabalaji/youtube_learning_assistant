"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "@/types";
import { User, Bot, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl p-4 shadow-sm space-y-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-xs"
            : "bg-card border border-border/60 text-foreground rounded-tl-xs"
        }`}
      >
        <div className="prose-custom dark:prose-invert text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Sources / Citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="pt-3 border-t border-border/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Retrieved Sources ({message.sources.length}):</span>
            </div>
            <div className="space-y-1.5">
              {message.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Chunk #{source.chunk_index ?? idx + 1}</span>
                    {source.relevance_score && (
                      <span className="text-emerald-500 font-semibold">
                        {Math.round(source.relevance_score * 100)}% match
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 italic text-foreground/80">
                    "{source.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
