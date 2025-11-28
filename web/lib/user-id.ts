import { settingApi } from "@/service/local/api-setting";
import { CurrentOfflineUser } from "@/service/local/api-setting";

import { CURRENT_USER_KEY } from "./constant";

/**
 * Gets the current userId from settings (for offline mode)
 * This should be used when navigator.onLine is false or when auth context is not available
 */
export async function getCurrentUserIdFromSettings(): Promise<string> {
  const setting = await settingApi.getByName(CURRENT_USER_KEY);
  return (setting?.value as CurrentOfflineUser).id;
}
