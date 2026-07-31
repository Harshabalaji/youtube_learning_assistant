"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeVideo, getVideoContent, getProviders, getAnalysisStatus } from "@/lib/api";
import type { AnalyzeRequest } from "@/types";

/**
 * Hook for submitting a YouTube video for analysis.
 * The backend now returns immediately with { status: "processing" }.
 */
export function useAnalyze() {
  return useMutation({
    mutationFn: (data: AnalyzeRequest) => analyzeVideo(data),
  });
}

/**
 * Hook for polling analysis status while processing.
 * Polls every 3 seconds until status is "completed" or "failed".
 */
export function useAnalysisStatus(videoId: string | undefined) {
  return useQuery({
    queryKey: ["analysis-status", videoId],
    queryFn: () => getAnalysisStatus(videoId!),
    enabled: !!videoId,
    // Poll every 3 seconds while still processing
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      if (status === "completed" || status === "failed") return false;
      return 3000;
    },
    // Don't throw on error — just keep polling
    retry: 3,
    staleTime: 0,
  });
}

/**
 * Hook for fetching video content (all generated materials).
 * Only used once the analysis status is "completed".
 */
export function useVideoContent(videoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideoContent(videoId!),
    enabled: !!videoId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching available LLM providers.
 */
export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: () => getProviders(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
