/**
 * API client for the YouTube Learning Assistant backend.
 */

import axios from "axios";
import type {
  AnalyzeRequest,
  ApiResponse,
  ChatRequest,
  VideoAnalysis,
  ProvidersResponse,
  QuizResult,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 300000, // 5 minutes for long analysis
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Analysis ────────────────────────────────────────────────────

export async function analyzeVideo(data: AnalyzeRequest) {
  const response = await api.post<ApiResponse<any>>("/analyze", data);
  return response.data;
}

export async function getVideoContent(videoId: string) {
  const response = await api.get<ApiResponse<VideoAnalysis>>(
    `/video/${videoId}`
  );
  return response.data;
}

export async function getAnalysisStatus(videoId: string) {
  const response = await api.get(`/analyze/${videoId}/status`);
  return response.data;
}

// ── Content ─────────────────────────────────────────────────────

export async function getSummary(videoId: string) {
  const response = await api.get(`/summary/${videoId}`);
  return response.data;
}

export async function getNotes(videoId: string) {
  const response = await api.get(`/notes/${videoId}`);
  return response.data;
}

export async function getFlashcards(videoId: string, filters?: { difficulty?: string; category?: string }) {
  const params = new URLSearchParams();
  if (filters?.difficulty) params.set("difficulty", filters.difficulty);
  if (filters?.category) params.set("category", filters.category);
  const response = await api.get(`/flashcards/${videoId}?${params}`);
  return response.data;
}

export async function toggleFlashcardBookmark(flashcardId: number) {
  const response = await api.put(`/flashcards/${flashcardId}/bookmark`);
  return response.data;
}

export async function getQuiz(videoId: string) {
  const response = await api.get(`/quiz/${videoId}`);
  return response.data;
}

export async function submitQuiz(videoId: string, answers: number[], timeTaken: number) {
  const response = await api.post<ApiResponse<QuizResult>>(
    `/quiz/${videoId}/submit`,
    null,
    { params: { answers: answers.join(","), time_taken: timeTaken } }
  );
  return response.data;
}

export async function getMindMap(videoId: string) {
  const response = await api.get(`/mindmap/${videoId}`);
  return response.data;
}

export async function getTimeline(videoId: string) {
  const response = await api.get(`/timeline/${videoId}`);
  return response.data;
}

// ── Chat ────────────────────────────────────────────────────────

export async function sendChatMessage(data: ChatRequest) {
  const response = await api.post("/chat", data);
  return response.data;
}

export async function getChatSessions(videoId: string) {
  const response = await api.get(`/chat/sessions/${videoId}`);
  return response.data;
}

export async function getChatMessages(sessionId: number) {
  const response = await api.get(`/chat/messages/${sessionId}`);
  return response.data;
}

// ── Export ───────────────────────────────────────────────────────

export function getExportUrl(videoId: string, format: "pdf" | "docx" | "markdown") {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  return `${baseUrl}/export/${videoId}/${format}`;
}

// ── History ─────────────────────────────────────────────────────

export async function getHistory(page = 1, limit = 20) {
  const response = await api.get(`/history?page=${page}&limit=${limit}`);
  return response.data;
}

export async function deleteVideo(videoId: string) {
  const response = await api.delete(`/history/${videoId}`);
  return response.data;
}

// ── Providers ───────────────────────────────────────────────────

export async function getProviders() {
  const response = await api.get<ProvidersResponse>("/providers");
  return response.data;
}

// ── Auth ────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
}

export async function register(username: string, email: string, password: string) {
  const response = await api.post("/auth/register", { username, email, password });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

export default api;
