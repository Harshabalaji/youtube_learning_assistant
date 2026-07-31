"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles, AlertCircle, Cpu, Loader2, ChevronDown, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyze, useProviders } from "@/hooks/useAnalysis";

// Provider brand colors
const PROVIDER_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  gemini:  { bg: "bg-blue-500/10",    border: "border-blue-500/30",    text: "text-blue-400",    dot: "bg-blue-400" },
  openai:  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  ollama:  { bg: "bg-amber-500/10",   border: "border-amber-500/30",   text: "text-amber-400",   dot: "bg-amber-400" },
  default: { bg: "bg-violet-500/10",  border: "border-violet-500/30",  text: "text-violet-400",  dot: "bg-violet-400" },
};

function getProviderStyle(key: string) {
  return PROVIDER_STYLES[key] ?? PROVIDER_STYLES.default;
}

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();
  const analyzeMutation = useAnalyze();
  const { data: providersData } = useProviders();

  // Auto-select first available provider when data loads
  useEffect(() => {
    if (providersData?.providers) {
      const available = Object.entries(providersData.providers).find(
        ([, p]) => (p as any).available
      );
      if (available) {
        setSelectedProvider(available[0]);
        const models = (available[1] as any).models;
        if (models?.length) setSelectedModel(models[0]);
      }
    }
  }, [providersData]);

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

    const match = url.match(/(?:v=|\/)(?:[\w-]{11})/);
    const rawId = match ? match[0].replace(/^(v=|\/)/, "") : null;

    if (!rawId) {
      setValidationError("Could not extract Video ID from URL");
      return;
    }

    analyzeMutation.mutate(
      { url, llm_provider: selectedProvider, model: selectedModel || undefined },
      {
        onSuccess: () => router.push(`/dashboard/${rawId}`),
        onError: (error: any) => {
          setValidationError(
            error.response?.data?.detail || "Failed to start analysis. Please try again."
          );
        },
      }
    );
  };

  const isLoading = analyzeMutation.isPending;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── Main input box ──────────────────────────────── */}
        <div className="relative group">
          {/* Animated glow ring */}
          <div
            className={`absolute -inset-[2px] rounded-2xl transition-all duration-500 pointer-events-none ${
              focused
                ? "bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 opacity-80 blur-[3px]"
                : "bg-gradient-to-r from-violet-600/40 via-purple-500/30 to-indigo-600/40 opacity-30 group-hover:opacity-60 blur-[2px]"
            }`}
          />

          <div className="relative flex items-center bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
            {/* Play icon */}
            <div className="pl-4 pr-3 shrink-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                focused ? "gradient-bg shadow-lg shadow-purple-500/30" : "bg-muted"
              }`}>
                <Play className={`w-4 h-4 transition-colors ${focused ? "text-white" : "text-muted-foreground"}`} />
              </div>
            </div>

            {/* URL input */}
            <input
              type="text"
              id="youtube-url-input"
              placeholder="Paste a YouTube URL — any lecture, tutorial, or video…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 h-14 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-medium outline-none border-none"
            />

            {/* Submit button */}
            <div className="pr-2 shrink-0">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 px-5 rounded-xl font-bold text-sm gap-2 gradient-bg text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Starting…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Validation error ────────────────────────────── */}
        {validationError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 animate-fade-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ── LLM Provider bar ────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 bg-muted/30 backdrop-blur-md rounded-xl p-3 border border-border/40">
          <div className="flex items-center gap-1.5 mr-1">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">AI Engine:</span>
          </div>

          {providersData?.providers ? (
            Object.entries(providersData.providers).map(([key, provider]) => {
              const isSelected = selectedProvider === key;
              const style = getProviderStyle(key);
              return (
                <button
                  type="button"
                  key={key}
                  id={`provider-${key}`}
                  onClick={() => {
                    setSelectedProvider(key);
                    setSelectedModel((provider as any).models?.[0] || "");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? `${style.bg} ${style.border} ${style.text} shadow-sm scale-105`
                      : "bg-background/60 hover:bg-background border-border text-muted-foreground hover:scale-105"
                  }`}
                >
                  {/* Colored dot */}
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? style.dot : "bg-muted-foreground/40"}`} />
                  {(provider as any).name || key.charAt(0).toUpperCase() + key.slice(1)}
                  {isSelected && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })
          ) : (
            // Skeleton placeholders while loading
            <>
              {["Gemini", "OpenAI", "Ollama"].map((name) => (
                <div key={name} className="px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground/40 font-semibold animate-pulse">
                  {name}
                </div>
              ))}
            </>
          )}

          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <Zap className="w-3 h-3" />
            <span>~90s</span>
          </div>
        </div>
      </form>
    </div>
  );
}
