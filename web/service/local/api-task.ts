import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { useAuthGuard } from "@/components/layouts/auth-guard";
import { asciiCompare } from "@/lib/ascii-compare";
import { db, type Task } from "@/lib/dexie";
import { cleanUndefinedValue } from "@/lib/object";
import { getCurrentUserIdFromSettings } from "@/lib/user-id";

export type CreateTaskReq = {
  projectId?: string | null;
  title?: string;
  description?: string;
  status?: number;
  sortOrder?: string;
  dueDate?: string;
};

export type UpdateTaskReq = {
  id: string;
  projectId?: string | null;
  title?: string;
  description?: string;
  status?: number;
  sortOrder?: string;
  dueDate?: string;
};

export type UpsertTaskReq = {
  id: string;
  projectId?: string | null;
  title?: string;
  description?: string;
  status?: number;
  sortOrder?: string;
  dueDate?: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type TaskRes = Task;

export const taskApi = {
  create: async (data: CreateTaskReq): Promise<TaskRes> => {
    const userId = await getCurrentUserIdFromSettings();
    if (!userId) {
      throw new Error("User ID not available. Please login again.");
    }
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      userId,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status ?? 0,
      sortOrder: data.sortOrder,
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    await db.tasks.add(task);
    return task;
  },

  getAll: async (params?: {
    projectId?: string;
    sortBy?: "sortOrder";
    unsynced?: boolean;
    userId?: string;
  }): Promise<TaskRes[]> => {
    const projectId = params?.projectId;
    const unsynced = params?.unsynced;
    const userId = params?.userId;
    let tasks = await db.tasks
      .filter((task) => !task.deletedAt)
      .filter((task) => !userId || task.userId === userId)
      .filter(
        (task) =>
          !unsynced ||
          !task.syncedAt ||
          new Date(task.syncedAt ?? new Date(0)).getTime() < new Date(task.updatedAt).getTime()
      )
      .toArray();
    if (projectId) {
      tasks = tasks.filter((task) => task.projectId === projectId);
    }
    if (params?.sortBy === "sortOrder" || params?.sortBy === undefined) {
      console.log("sort order");
      tasks = tasks.sort((a, b) => asciiCompare(a.sortOrder ?? "", b.sortOrder ?? "") ?? 0);
    }
    return tasks;
  },

  getById: async (id: string): Promise<TaskRes | undefined> => {
    const task = await db.tasks.get(id);
    if (task && !task.deletedAt) {
      return task;
    }
    return undefined;
  },

  update: async (data: UpdateTaskReq): Promise<TaskRes> => {
    const existing = await db.tasks.get(data.id);
    if (!existing || existing.deletedAt) {
      throw new Error("Task not found");
    }

    const cleanedData = cleanUndefinedValue(data);

    const updated: Task = {
      ...existing,
      ...cleanedData,
      updatedAt: new Date().toISOString(),
    };
    console.log("taskApi.update existing", existing);
    console.log("taskApi.update data", data);
    console.log("taskApi.update cleanedData", cleanedData);
    console.log("taskApi.update updated", updated);
    await db.tasks.update(data.id, updated);
    return updated;
  },

  upsert: async (data: UpsertTaskReq, userId: string): Promise<TaskRes> => {
    const existing = await db.tasks.get(data.id);
    if (!existing || existing.deletedAt) {
      const now = new Date().toISOString();
      const task: Task = {
        id: data.id ?? crypto.randomUUID(),
        userId,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status ?? 0,
        sortOrder: data.sortOrder,
        dueDate: data.dueDate,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
        deletedAt: data.deletedAt,
        syncedAt: data.syncedAt,
      };
      await db.tasks.add(task);
      return task;
    }

    const updated: Task = {
      ...existing,
      ...data,
      userId: existing.userId, // Preserve existing userId
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      deletedAt: data.deletedAt,
    };
    await db.tasks.update(data.id, updated);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const existing = await db.tasks.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error("Task not found");
    }

    await db.tasks.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

export const useCreateTask = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TaskRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuthGuard();
  const getCurrentUserId = useCallback(async () => {
    if (userId) return userId;
    return await getCurrentUserIdFromSettings();
  }, [userId]);

  const mutate = useCallback(
    async (data: CreateTaskReq) => {
      setIsLoading(true);
      try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
          throw new Error("User ID not available");
        }
        const result = await taskApi.create(data);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        onError?.(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, getCurrentUserId]
  );

  return { mutate, isLoading };
};

export const useGetTasks = (params?: {
  projectId?: string;
  sortBy?: "sortOrder";
  unsynced?: boolean;
}) => {
  const { projectId, sortBy, unsynced } = params ?? {};
  const { userId } = useAuthGuard();
  const tasks = useLiveQuery(async () => {
    const currentUserId = userId || (await getCurrentUserIdFromSettings());
    return await taskApi.getAll({ projectId, sortBy, unsynced, userId: currentUserId });
  }, [projectId, sortBy, unsynced, userId]);

  return {
    data: tasks ?? [],
    isLoading: tasks === undefined,
  };
};

export const useGetTask = (id: string | undefined) => {
  const task = useLiveQuery(async () => {
    if (!id) return undefined;
    return await taskApi.getById(id);
  }, [id]);

  return {
    data: task,
    isLoading: task === undefined && id !== undefined,
  };
};

export const useUpdateTask = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TaskRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: UpdateTaskReq) => {
      setIsLoading(true);
      try {
        const result = await taskApi.update(data);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        onError?.(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return { mutate, isLoading };
};

export const useDeleteTask = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await taskApi.delete(id);
        onSuccess?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        onError?.(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return { mutate, isLoading };
};

export const taskApiHook = {
  useCreateTask,
  useGetTasks,
  useGetTask,
  useUpdateTask,
  useDeleteTask,
};
