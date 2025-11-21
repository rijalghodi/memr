import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { db, type Project } from "@/lib/dexie";

export type CreateProjectReq = {
  title?: string;
  description?: string;
  color?: string;
};

export type UpdateProjectReq = {
  id: string;
  title?: string;
  description?: string;
  color?: string;
};

export type UpsertProjectReq = {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type ProjectRes = Project & {
  tasksCount?: number;
};

export const projectApi = {
  create: async (data: CreateProjectReq): Promise<ProjectRes> => {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(project);
    return project;
  },

  getAll: async (params?: {
    sortBy?: "updatedAt" | "createdAt" | "viewedAt";
    unsynced?: boolean;
  }): Promise<ProjectRes[]> => {
    const { sortBy, unsynced } = params ?? {};
    const projects = await db.projects
      .filter((project) => !project.deletedAt)
      .filter(
        (project) =>
          !unsynced ||
          !project.syncedAt ||
          new Date(project.syncedAt ?? new Date(0)).getTime() <
            new Date(project.updatedAt).getTime()
      )
      .toArray(async (projects) =>
        Promise.all(
          projects.map(async (project) => ({
            ...project,
            tasksCount: await db.tasks
              .where("projectId")
              .equals(project.id)
              .filter((task) => !task.deletedAt)
              .count(),
          }))
        )
      );
    if (sortBy) {
      projects.sort((a, b) => {
        return (
          new Date(b[sortBy] ?? new Date(0)).getTime() -
          new Date(a[sortBy] ?? new Date(0)).getTime()
        );
      });
    }
    return projects;
  },

  getById: async (id: string): Promise<ProjectRes | undefined> => {
    const project = await db.projects.get(id);
    if (project && !project.deletedAt) {
      return project;
    }
    return undefined;
  },

  update: async (data: UpdateProjectReq): Promise<ProjectRes> => {
    const existing = await db.projects.get(data.id);
    if (!existing || existing.deletedAt) {
      throw new Error("Project not found");
    }

    const updated: Project = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.projects.update(data.id, updated);
    return updated;
  },

  upsert: async (data: UpsertProjectReq): Promise<ProjectRes> => {
    const existing = await db.projects.get(data.id);
    if (!existing || existing.deletedAt) {
      const now = new Date().toISOString();
      const project: Project = {
        id: data.id,
        title: data.title,
        description: data.description,
        color: data.color,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
        deletedAt: data.deletedAt,
        syncedAt: data.syncedAt,
      };
      await db.projects.add(project);
      return project;
    }

    const updated: Project = {
      ...existing,
      ...data,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      deletedAt: data.deletedAt,
    };
    await db.projects.update(data.id, updated);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const existing = await db.projects.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error("Project not found");
    }

    await db.projects.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

export const useCreateProject = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ProjectRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: CreateProjectReq) => {
      setIsLoading(true);
      try {
        const result = await projectApi.create(data);
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

export const useGetProjects = (params?: {
  sortBy?: "updatedAt" | "createdAt" | "viewedAt";
  unsynced?: boolean;
}) => {
  const { sortBy, unsynced } = params ?? {};
  const projects = useLiveQuery(async () => {
    return await projectApi.getAll({ sortBy, unsynced });
  }, []);

  return {
    data: projects ?? [],
    isLoading: projects === undefined,
  };
};

export const useGetProject = (id: string | undefined) => {
  const project = useLiveQuery(async () => {
    if (!id) return undefined;
    return await projectApi.getById(id);
  }, [id]);

  return {
    data: project,
    isLoading: project === undefined && id !== undefined,
  };
};

export const useUpdateProject = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ProjectRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: UpdateProjectReq) => {
      setIsLoading(true);
      try {
        const result = await projectApi.update(data);
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

export const useDeleteProject = ({
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
        await projectApi.delete(id);
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

export const projectApiHook = {
  useCreateProject,
  useGetProjects,
  useGetProject,
  useUpdateProject,
  useDeleteProject,
};
