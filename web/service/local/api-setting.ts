import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";

import { CURRENT_USER_KEY, LAST_SYNC_TIME_KEY } from "@/lib/constant";
import { db, type Settings } from "@/lib/dexie";

export type CurrentOfflineUser = {
  id: string;
  email: string;
  name: string;
  googleImage?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SettingReq =
  | {
      name: typeof CURRENT_USER_KEY;
      value: CurrentOfflineUser;
    }
  | {
      name: typeof LAST_SYNC_TIME_KEY;
      value: string;
    }
  | {
      name: string;
      value: string | number | boolean | object;
    };

export type SettingRes = Settings;

export const settingApi = {
  create: async (data: SettingReq): Promise<SettingRes> => {
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

  upsert: async (data: SettingReq): Promise<SettingRes> => {
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
    async (data: SettingReq) => {
      setIsLoading(true);
      try {
        const result = await settingApi.create(data);
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

export const useGetSettings = () => {
  const settings = useLiveQuery(async () => {
    return await settingApi.getAll();
  }, []);

  return {
    data: settings ?? [],
    isLoading: settings === undefined,
  };
};

export const useGetSetting = (name: string) => {
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
    async (data: SettingReq) => {
      setIsLoading(true);
      try {
        const result = await settingApi.upsert(data);
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

export const useGetOfflineCurrentUser = () => {
  const q = useGetSetting(CURRENT_USER_KEY);
  return {
    value: q.data?.value as CurrentOfflineUser,
    isLoading: q.isLoading,
  };
};

export const useGetLastSyncTime = () => {
  const q = useGetSetting(LAST_SYNC_TIME_KEY);
  return {
    value: q.data?.value as string,
    isLoading: q.isLoading,
  };
};

export const settingApiHook = {
  useCreateSetting,
  useGetSettings,
  useGetSetting,
  useUpdateSetting: useUpsertSetting,
  useDeleteSetting,
  useGetOfflineCurrentUser,
  useGetLastSyncTime,
};
