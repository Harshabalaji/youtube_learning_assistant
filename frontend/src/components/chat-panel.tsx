"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat-message";
import { Send, Bot, Sparkles, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatPanelProps {
  videoId: string;
}

export function ChatPanel({ videoId }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, clearChat, isStreaming } = useChat(videoId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    sendMessage(msg);
  };

  const SUGGESTED_QUESTIONS = [
    "What is the main topic of this video?",
    "What are the 3 most important takeaways?",
    "Can you explain the key concepts discussed?",
    "What real-world examples were mentioned?",
  ];

  return (
    <div className="glass-card flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>Video Assistant RAG Chat</span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Ask any question about this video's contents
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="font-bold text-base text-foreground">
                Ask Questions About This Video
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Powered by ChromaDB vector search and RAG context injection.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg pt-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs p-3 rounded-xl bg-muted/40 hover:bg-accent border border-border/50 text-foreground/90 transition duration-150"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-border/50 bg-background/50 flex items-center gap-2"
      >
        <Input
          type="text"
          placeholder="Ask a question about the video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-11 text-sm bg-background border-border"
        />
        <Button
          type="submit"
          variant="gradient"
          size="icon"
          disabled={!input.trim() || isStreaming}
          className="h-11 w-11 rounded-xl shrink-0"
        >
          {isStreaming ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
