import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { type Collection, db } from "@/lib/dexie";

export type CreateCollectionReq = {
  title?: string;
  description?: string;
  color?: string;
};

export type UpdateCollectionReq = {
  id: string;
  title?: string;
  description?: string;
  color?: string;
};

export type UpsertCollectionReq = {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type CollectionRes = Collection;

export const collectionApi = {
  create: async (data: CreateCollectionReq): Promise<CollectionRes> => {
    const now = new Date().toISOString();
    const collection: Collection = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };
    await db.collections.add(collection);
    return collection;
  },

  getAll: async (params?: {
    sortBy?: "updatedAt" | "createdAt" | "viewedAt";
    unsynced?: boolean;
  }): Promise<CollectionRes[]> => {
    const { sortBy, unsynced } = params ?? {};
    const collections = await db.collections
      .filter((collection) => !collection.deletedAt)
      .filter(
        (collection) =>
          !unsynced ||
          !collection.syncedAt ||
          new Date(collection.syncedAt ?? new Date(0)).getTime() <
            new Date(collection.updatedAt).getTime()
      )
      .toArray();
    if (sortBy) {
      collections.sort((a, b) => {
        return (
          new Date(b[sortBy] ?? new Date(0)).getTime() -
          new Date(a[sortBy] ?? new Date(0)).getTime()
        );
      });
    }
    return collections;
  },

  getById: async (id: string): Promise<CollectionRes | undefined> => {
    const collection = await db.collections.get(id);
    if (collection && !collection.deletedAt) {
      return collection;
    }
    return undefined;
  },

  update: async (data: UpdateCollectionReq): Promise<CollectionRes> => {
    const existing = await db.collections.get(data.id);
    if (!existing || existing.deletedAt) {
      throw new Error("Collection not found");
    }

    const updated: Collection = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.collections.update(data.id, updated);
    return updated;
  },

  upsert: async (data: UpsertCollectionReq): Promise<CollectionRes> => {
    const existing = await db.collections.get(data.id);
    if (!existing || existing.deletedAt) {
      const now = new Date().toISOString();
      const collection: Collection = {
        id: data.id,
        title: data.title,
        description: data.description,
        color: data.color,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
        deletedAt: data.deletedAt,
        syncedAt: data.syncedAt,
      };
      await db.collections.add(collection);
      return collection;
    }

    const updated: Collection = {
      ...existing,
      ...data,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      deletedAt: data.deletedAt,
    };
    await db.collections.update(data.id, updated);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const existing = await db.collections.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error("Collection not found");
    }

    await db.collections.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

export const useCreateCollection = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CollectionRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: CreateCollectionReq) => {
      setIsLoading(true);
      try {
        const result = await collectionApi.create(data);
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

export const useGetCollections = (params?: {
  sortBy?: "updatedAt" | "createdAt" | "viewedAt";
  unsynced?: boolean;
}) => {
  const { sortBy, unsynced } = params ?? {};
  const collections = useLiveQuery(async () => {
    return await collectionApi.getAll({ sortBy, unsynced });
  }, []);

  return {
    data: collections ?? [],
    isLoading: collections === undefined,
  };
};

export const useGetCollection = (id: string | undefined) => {
  const collection = useLiveQuery(async () => {
    if (!id) return undefined;
    return await collectionApi.getById(id);
  }, [id]);

  return {
    data: collection,
    isLoading: collection === undefined && id !== undefined,
  };
};

export const useUpdateCollection = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CollectionRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: UpdateCollectionReq) => {
      setIsLoading(true);
      try {
        const result = await collectionApi.update(data);
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

export const useDeleteCollection = ({
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
        await collectionApi.delete(id);
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

export const collectionApiHook = {
  useCreateCollection,
  useGetCollections,
  useGetCollection,
  useUpdateCollection,
  useDeleteCollection,
};
