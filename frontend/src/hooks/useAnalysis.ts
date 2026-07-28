"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeVideo, getVideoContent, getProviders } from "@/lib/api";
import type { AnalyzeRequest } from "@/types";

/**
 * Hook for analyzing a YouTube video.
 */
export function useAnalyze() {
  return useMutation({
    mutationFn: (data: AnalyzeRequest) => analyzeVideo(data),
  });
}

/**
 * Hook for fetching video content (all generated materials).
 */
export function useVideoContent(videoId: string | undefined) {
  return useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideoContent(videoId!),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
