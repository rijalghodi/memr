import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { db, type Change } from "@/lib/dexie";

export type CreateChangeReq = {
  entityId: string; // ID of the entity being changed
  type: "task" | "project" | "note" | "collection";
  title?: string;
  description?: string;
  projectId?: string;
  sortOrder?: string;
  dueDate?: string;
  status?: number;
  content?: string;
  color?: string;
  collectionId?: string;
  updatedAt: string;
  createdAt: string;
  deletedAt?: string;
};

export type UpdateChangeReq = {
  id: string;
  title?: string;
  description?: string;
  projectId?: string;
  sortOrder?: string;
  dueDate?: string;
  status?: number;
  content?: string;
  color?: string;
  collectionId?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type ChangeRes = Change;

const changeApi = {
  create: async (data: CreateChangeReq): Promise<ChangeRes> => {
    const change: Change = {
      id: crypto.randomUUID(),
      entityId: data.entityId,
      type: data.type,
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      sortOrder: data.sortOrder,
      dueDate: data.dueDate,
      status: data.status,
      content: data.content,
      color: data.color,
      collectionId: data.collectionId,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
      deletedAt: data.deletedAt,
    };
    await db.changes.add(change);
    return change;
  },

  getAll: async (type?: Change["type"]): Promise<ChangeRes[]> => {
    let changes = await db.changes
      .filter((change) => !change.deletedAt)
      .toArray();
    if (type) {
      changes = changes.filter((change) => change.type === type);
    }
    return changes;
  },

  getById: async (id: string): Promise<ChangeRes | undefined> => {
    const change = await db.changes.get(id);
    if (change && !change.deletedAt) {
      return change;
    }
    return undefined;
  },

  update: async (data: UpdateChangeReq): Promise<ChangeRes> => {
    const existing = await db.changes.get(data.id);
    if (!existing || existing.deletedAt) {
      throw new Error("Change not found");
    }

    const updated: Change = {
      ...existing,
      ...data,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
    await db.changes.update(data.id, updated);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const existing = await db.changes.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error("Change not found");
    }

    await db.changes.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

export const useCreateChange = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ChangeRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: CreateChangeReq) => {
      setIsLoading(true);
      try {
        const result = await changeApi.create(data);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
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

export const useGetChanges = (type?: Change["type"]) => {
  const changes = useLiveQuery(async () => {
    return await changeApi.getAll(type);
  }, [type]);

  return {
    data: changes ?? [],
    isLoading: changes === undefined,
  };
};

export const useGetChange = (id: string | undefined) => {
  const change = useLiveQuery(async () => {
    if (!id) return undefined;
    return await changeApi.getById(id);
  }, [id]);

  return {
    data: change,
    isLoading: change === undefined && id !== undefined,
  };
};

export const useUpdateChange = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ChangeRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: UpdateChangeReq) => {
      setIsLoading(true);
      try {
        const result = await changeApi.update(data);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
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

export const useDeleteChange = ({
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
        await changeApi.delete(id);
        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
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

export const changeApiHook = {
  useCreateChange,
  useGetChanges,
  useGetChange,
  useUpdateChange,
  useDeleteChange,
};
