"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Sparkles, AlertCircle, Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnalyze, useProviders } from "@/hooks/useAnalysis";
import { Badge } from "@/components/ui/badge";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();
  const analyzeMutation = useAnalyze();
  const { data: providersData } = useProviders();

  const validateUrl = (value: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
      /(?:https?:\/\/)?youtu\.be\/[\w-]{11}/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[\w-]{11}/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[\w-]{11}/,
    ];
    return patterns.some((p) => p.test(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!url.trim()) {
      setValidationError("Please enter a YouTube URL");
      return;
    }

    if (!validateUrl(url)) {
      setValidationError("Invalid YouTube URL. Please enter a valid video link.");
      return;
    }

    // Extract video ID for routing
    const match = url.match(/(?:v=|\/)([\w-]{11})/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      setValidationError("Could not extract Video ID");
      return;
    }

    try {
      // Start analysis
      analyzeMutation.mutate(
        {
          url,
          llm_provider: selectedProvider,
          model: selectedModel || undefined,
        },
        {
          onSuccess: (data) => {
            router.push(`/dashboard/${videoId}`);
          },
          onError: (error: any) => {
            setValidationError(
              error.response?.data?.detail || "Failed to start analysis. Please try again."
            );
          },
        }
      );
    } catch (err: any) {
      setValidationError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative flex items-center bg-card/90 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl">
            <div className="pl-4 pr-2 text-muted-foreground">
              <Play className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <Input
              type="text"
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 text-foreground placeholder:text-muted-foreground/60"
            />
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={analyzeMutation.isPending}
              className="rounded-xl px-6 font-semibold shrink-0 gap-2"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Material</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </motion.div>
        )}

        {/* LLM Provider Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-muted/40 backdrop-blur-md rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="font-medium text-muted-foreground">AI Engine:</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {providersData?.providers ? (
              Object.entries(providersData.providers).map(([key, provider]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setSelectedProvider(key);
                    setSelectedModel(provider.models[0] || "");
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedProvider === key
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background/60 hover:bg-background border-border text-muted-foreground"
                  }`}
                >
                  {provider.name}
                </button>
              ))
            ) : (
              <>
                <Badge variant="outline">OpenAI (GPT-4.1)</Badge>
                <Badge variant="outline">Gemini 2.5</Badge>
                <Badge variant="outline">Ollama (Local)</Badge>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
