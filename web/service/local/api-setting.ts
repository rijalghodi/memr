import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { db, type Settings } from "@/lib/dexie";

export type CreateSettingReq = {
  name: string;
  value: string | number | boolean | object;
};

export type UpsertSettingReq = {
  name: string;
  value: string | number | boolean | object;
};

export type SettingRes = Settings;

const settingApi = {
  create: async (data: CreateSettingReq): Promise<SettingRes> => {
    const now = new Date().toISOString();
    const setting: Settings = {
      name: data.name,
      value: data.value,
      createdAt: now,
      updatedAt: now,
    };
    await db.settings.add(setting);
    return setting;
  },

  getAll: async (): Promise<SettingRes[]> => {
    const settings = await db.settings.toArray();
    return settings;
  },

  getByName: async (name: string): Promise<SettingRes | undefined> => {
    const setting = await db.settings.get(name);
    if (setting) {
      return setting;
    }
    return undefined;
  },

  upsert: async (data: UpsertSettingReq): Promise<SettingRes> => {
    const existing = await db.settings.get(data.name);
    if (!existing) {
      return await settingApi.create(data);
    }

    const updated: Settings = {
      ...existing,
      value: data.value,
      updatedAt: new Date().toISOString(),
    };
    await db.settings.update(data.name, updated);
    console.log("updated setting", updated);
    return updated;
  },

  delete: async (name: string): Promise<void> => {
    const existing = await db.settings.get(name);
    if (!existing) {
      return;
    }

    await db.settings.delete(name);
  },
};

export const useCreateSetting = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SettingRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: CreateSettingReq) => {
      setIsLoading(true);
      try {
        const result = await settingApi.create(data);
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
    [onSuccess, onError],
  );

  return { mutate, isLoading };
};

export const useGetSettings = () => {
  const settings = useLiveQuery(async () => {
    return await settingApi.getAll();
  }, []);

  return {
    data: settings ?? [],
    isLoading: settings === undefined,
  };
};

export const useGetSetting = (name: string | undefined) => {
  const setting = useLiveQuery(async () => {
    if (!name) return undefined;
    return await settingApi.getByName(name);
  }, [name]);

  return {
    data: setting,
    isLoading: setting === undefined && name !== undefined,
  };
};

export const useUpsertSetting = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SettingRes) => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (data: UpsertSettingReq) => {
      setIsLoading(true);
      try {
        const result = await settingApi.upsert(data);
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
    [onSuccess, onError],
  );

  return { mutate, isLoading };
};

export const useDeleteSetting = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (name: string) => {
      setIsLoading(true);
      try {
        await settingApi.delete(name);
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
    [onSuccess, onError],
  );

  return { mutate, isLoading };
};

export const settingApiHook = {
  useCreateSetting,
  useGetSettings,
  useGetSetting,
  useUpdateSetting: useUpsertSetting,
  useDeleteSetting,
};
