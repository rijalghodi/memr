import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { db, type Project } from "@/lib/dexie";

export type CreateProjectReq = {
  userId: string;
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

export type ProjectRes = Project;

const projectApi = {
  create: async (data: CreateProjectReq): Promise<ProjectRes> => {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      userId: data.userId,
      title: data.title,
      description: data.description,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(project);
    return project;
  },

  getAll: async (userId?: string): Promise<ProjectRes[]> => {
    let projects = await db.projects
      .filter((project) => !project.deletedAt)
      .toArray();
    if (userId) {
      projects = projects.filter((project) => project.userId === userId);
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

export const useGetProjects = (userId?: string) => {
  const projects = useLiveQuery(async () => {
    return await projectApi.getAll(userId);
  }, [userId]);

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
