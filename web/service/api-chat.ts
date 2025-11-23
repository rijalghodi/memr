import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import Cookies from "js-cookie";

import { ACCESS_TOKEN_KEY } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

// Types matching Go contracts
export type ChatStartRes = {
  id: string;
};

export type ChatRes = {
  id: string;
  firstMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type ToolCallRes = {
  id: string;
  name?: string;
  arguments: Record<string, any>;
  createdAt: string;
};

export type MessageRes = {
  id: string;
  role: string;
  content: string | null;
  createdAt: string;
  toolCalls?: ToolCallRes[];
};

export type ChatHistoryRes = {
  messages: MessageRes[];
};

export type ChatSendReq = {
  message: string;
};

export type ChatStreamChunk = {
  content: string;
  done: boolean;
  error?: string;
};

// Paginated response structure from Go's ToPaginatedResponse
export type PaginatedChatData = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: ChatRes[];
};

export type ChatListRes = {
  status: boolean;
  message: string;
  data: PaginatedChatData;
};

// API Response types
export type ChatStartApiRes = GResponse<ChatStartRes>;
export type ChatHistoryApiRes = GResponse<ChatHistoryRes>;
export type ChatListApiRes = ChatListRes;

// API functions
export const chatApi = {
  startChat: async (): Promise<ChatStartApiRes> => {
    const response = await apiClient.post("/v1/chats");
    return response.data;
  },

  listChats: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ChatListApiRes> => {
    const response = await apiClient.get("/v1/chats", {
      params: { page, limit },
    });
    return response.data;
  },

  getChatHistory: async (chatId: string): Promise<ChatHistoryApiRes> => {
    const response = await apiClient.get(`/v1/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessageStream: async (
    chatId: string,
    message: string,
    onChunk: (chunk: ChatStreamChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/chats/${chatId}/messages?stream=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6); // Remove "data: " prefix
            try {
              const chunk: ChatStreamChunk = JSON.parse(jsonStr);
              onChunk(chunk);

              if (chunk.done) {
                onComplete?.();
                return;
              }

              if (chunk.error) {
                onError?.(new Error(chunk.error));
                return;
              }
            } catch (e) {
              console.error("Failed to parse SSE chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    }
  },
};

// React Query hooks
export const LIST_CHATS_KEY = "list-chats";
export const GET_CHAT_HISTORY_KEY = "get-chat-history";

export const useStartChat = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ChatStartApiRes) => void;
  onError?: (error: string) => void;
}): UseMutationResult<ChatStartApiRes, GErrorResponse, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatApi.startChat(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [LIST_CHATS_KEY],
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useListChats = (
  page: number = 1,
  limit: number = 20
): UseQueryResult<ChatListApiRes, GErrorResponse> => {
  return useQuery({
    queryKey: [LIST_CHATS_KEY, page, limit],
    queryFn: () => chatApi.listChats(page, limit),
  });
};

export const useGetChatHistory = (
  chatId: string | null
): UseQueryResult<ChatHistoryApiRes, GErrorResponse> => {
  return useQuery({
    queryKey: [GET_CHAT_HISTORY_KEY, chatId],
    queryFn: () => {
      if (!chatId) throw new Error("Chat ID is required");
      return chatApi.getChatHistory(chatId);
    },
    enabled: !!chatId,
  });
};

export const chatApiHook = {
  useStartChat,
  useListChats,
  useGetChatHistory,
};
