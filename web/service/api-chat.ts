import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse, MRequest, MResponse } from "./type";

export type FaceRes = {
  name: string;
  url: string;
};

export type StudentRes = {
  name: string;
  face: FaceRes;
};

export type ChatRes = {
  id: string;
  title: string;
  studentId: string;
  student: StudentRes;
  createdAt?: string;
  updatedAt?: string;
};

export type MessageRes = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateChatRes = GResponse<ChatRes>;

export type ListMessagesParams = MRequest;

export type ListMessagesRes = MResponse<MessageRes>;

export type SendMessageReq = {
  content: string;
  type: string;
};

export type SendMessageRes = GResponse<MessageRes>;

export const chatApi = {
  createChat: async (studentId: string): Promise<CreateChatRes> => {
    const response = await apiClient.post(`/students/${studentId}/chat`);
    return response.data;
  },

  listMessages: async (
    studentId: string,
    params?: ListMessagesParams
  ): Promise<ListMessagesRes> => {
    const response = await apiClient.get(
      `/students/${studentId}/chat/messages`,
      { params }
    );
    return response.data;
  },

  sendMessage: async (
    studentId: string,
    data: SendMessageReq
  ): Promise<SendMessageRes> => {
    const response = await apiClient.post(
      `/students/${studentId}/chat/messages`,
      data
    );
    return response.data;
  },
};

export const useCreateChat = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CreateChatRes, studentId: string) => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId }: { studentId: string }) =>
      chatApi.createChat(studentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LIST_MESSAGES_KEY, variables.studentId],
      });
      onSuccess?.(data, variables.studentId);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const LIST_MESSAGES_KEY = "list-messages";

export const useListMessages = (
  studentId: string,
  params?: ListMessagesParams,
  enabled: boolean = true
): UseQueryResult<ListMessagesRes, GErrorResponse> => {
  return useQuery({
    queryKey: [LIST_MESSAGES_KEY, studentId, params],
    queryFn: () => chatApi.listMessages(studentId, params),
    enabled: enabled && !!studentId,
  });
};

export const useSendMessage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SendMessageRes, studentId: string) => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: SendMessageReq;
    }) => chatApi.sendMessage(studentId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LIST_MESSAGES_KEY, variables.studentId],
      });
      onSuccess?.(data, variables.studentId);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const chatApiHook = {
  useListMessages: useListMessages,
  useSendMessage: useSendMessage,
  useCreateChat: useCreateChat,
};
