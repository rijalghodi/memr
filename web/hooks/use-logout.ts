import { useCallback, useState } from "react";

import { removeAuthCookie } from "@/lib/auth-cookie";
import { SESSION_TABS_KEY } from "@/lib/constant";
import { db } from "@/lib/dexie";
import { ROUTES } from "@/lib/routes";

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    // Clear all Dexie tables
    await Promise.all(db.tables.map((table) => table.clear()));
    // Delete auth cookies
    removeAuthCookie();
    // Clear all local storage tabs
    localStorage.removeItem(SESSION_TABS_KEY);
    // Redirect to login page
    window.location.href = ROUTES.LOGIN;
    setIsLoggingOut(false);
  }, []);
  return { isLoggingOut, logout };
};
