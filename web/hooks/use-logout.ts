import { useCallback, useState } from "react";

import { removeAuthCookie } from "@/lib/auth-cookie";
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
    // Redirect to login page
    window.location.href = ROUTES.LOGIN;
    setIsLoggingOut(false);
  }, []);
  return { isLoggingOut, logout };
};
