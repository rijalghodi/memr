import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

export type Change = {
  collectionId?: string; // Note-only
  color?: string; // Project and collection-only
  content?: string;
  createdAt?: string;
  deletedAt?: string;
  description?: string;
  dueDate?: string;
  id: string;
  projectId?: string; // Task-only
  sortOrder?: string;
  status?: number;
  title?: string;
  type: "task" | "project" | "note" | "collection";
  updatedAt?: string;
};

export type SyncReq = {
  changes: Change[];
  lastSyncTime?: string;
};

export type SyncRes = {
  changes: Change[];
  lastSyncTime: string;
};

export type SyncApiRes = GResponse<SyncRes>;

export const syncApi = {
  sync: async (data: SyncReq): Promise<SyncApiRes> => {
    const response = await apiClient.post("/v1/sync", data);
    return response.data;
  },
};

export const useSync = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SyncApiRes) => void;
  onError?: (error: string) => void;
}): UseMutationResult<SyncApiRes, GErrorResponse, SyncReq> => {
  return useMutation({
    mutationFn: (data: SyncReq) => syncApi.sync(data),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const syncApiHook = {
  useSync,
};
