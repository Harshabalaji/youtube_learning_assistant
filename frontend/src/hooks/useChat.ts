"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sendChatMessage, getChatSessions, getChatMessages } from "@/lib/api";
import type { ChatMessage, ChatRequest } from "@/types";

/**
 * Hook for RAG-powered chat with streaming support.
 */
export function useChat(videoId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      provider?: string,
      model?: string
    ) => {
      // Add user message immediately
      const userMsg: ChatMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const data: ChatRequest = {
          video_id: videoId,
          message,
          session_id: sessionId || undefined,
          llm_provider: provider,
          model,
        };

        const response = await sendChatMessage(data);

        if (response.success) {
          const { data: chatData } = response;
          setSessionId(chatData.session_id);

          const assistantMsg: ChatMessage = {
            id: chatData.message.id,
            role: "assistant",
            content: chatData.message.content,
            sources: chatData.sources,
            created_at: chatData.message.created_at,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch (error: any) {
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [videoId, sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const loadSession = useCallback(async (id: number) => {
    try {
      const response = await getChatMessages(id);
      if (response.success) {
        setMessages(response.data.messages);
        setSessionId(id);
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
    }
  }, []);

  return {
    messages,
    isStreaming,
    sessionId,
    sendMessage,
    clearChat,
    loadSession,
  };
}

/**
 * Hook for fetching chat sessions.
 */
export function useChatSessions(videoId: string) {
  return useQuery({
    queryKey: ["chat-sessions", videoId],
    queryFn: () => getChatSessions(videoId),
    enabled: !!videoId,
  });
}
