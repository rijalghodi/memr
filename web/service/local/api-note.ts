import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { db, type Note } from "@/lib/dexie";

export type CreateNoteReq = {
  collectionId?: string;
  title?: string;
  content?: string;
};

export type UpdateNoteReq = {
  id: string;
  collectionId?: string;
  title?: string;
  content?: string;
};

export type NoteRes = Note;

const noteApi = {
  create: async (data: CreateNoteReq): Promise<NoteRes> => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      collectionId: data.collectionId,
      title: data.title,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.add(note);
    return note;
  },

  getAll: async (
    collectionId?: string,
    sortBy?: "updatedAt" | "createdAt" | "viewedAt"
  ): Promise<NoteRes[]> => {
    let notes = await db.notes.filter((note) => !note.deletedAt).toArray();
    if (collectionId) {
      notes = notes.filter((note) => note.collectionId === collectionId);
    }

    // Sort by specified field (always DESC)
    if (sortBy) {
      notes.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Handle undefined values - put them at the end
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        // Compare dates (DESC order - newest first)
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      });
    }

    return notes;
  },

  getById: async (id: string): Promise<NoteRes | undefined> => {
    const note = await db.notes.get(id);
    if (note && !note.deletedAt) {
      return note;
    }
    return undefined;
  },

  update: async (data: UpdateNoteReq): Promise<NoteRes> => {
    const existing = await db.notes.get(data.id);
    if (!existing || existing.deletedAt) {
      throw new Error("Note not found");
    }

    const updated: Note = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.notes.update(data.id, updated);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const existing = await db.notes.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error("Note not found");
    }

    await db.notes.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

export const useCreateNote = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: NoteRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: CreateNoteReq) => {
      setIsLoading(true);
      try {
        const result = await noteApi.create(data);
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

export const useGetNotes = (
  collectionId?: string,
  sortBy?: "updatedAt" | "createdAt" | "viewedAt"
) => {
  const notes = useLiveQuery(async () => {
    return await noteApi.getAll(collectionId, sortBy);
  }, [collectionId, sortBy]);

  return {
    data: notes ?? [],
    isLoading: notes === undefined,
  };
};

export const useGetNote = (id: string | undefined) => {
  const note = useLiveQuery(async () => {
    if (!id) return undefined;
    return await noteApi.getById(id);
  }, [id]);

  return {
    data: note,
    isLoading: note === undefined && id !== undefined,
  };
};

export const useUpdateNote = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: NoteRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: UpdateNoteReq) => {
      setIsLoading(true);
      try {
        const result = await noteApi.update(data);
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

export const useDeleteNote = ({
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
        await noteApi.delete(id);
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

export const noteApiHook = {
  useCreateNote,
  useGetNotes,
  useGetNote,
  useUpdateNote,
  useDeleteNote,
};
