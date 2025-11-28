import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { CURRENT_USER_KEY } from "@/lib/constant";
import { ROUTES } from "@/lib/routes";
import { getCurrentUserIdFromSettings } from "@/lib/user-id";
import { cn } from "@/lib/utils";
import { authApiHook } from "@/service/api-auth";
import { settingApi } from "@/service/local/api-setting";

// Verify network status on mount - use a request that bypasses service worker cache
const verifyNetworkStatus = async (onSuccess: (res: boolean) => void, onError: () => void) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch("/favicon.ico", {
      method: "HEAD",
      cache: "no-store", // Bypass all caches
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    onSuccess(response.ok);
  } catch {
    onError();
  }
};

type AuthGuardContextType = {
  isOnline: boolean;
  isAuthenticated: boolean;
  userId?: string;
  isLoading: boolean;
  error?: string;
  invalidate: () => void;
};

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(undefined);

export function useAuthGuard() {
  const context = useContext(AuthGuardContext);
  if (context === undefined) throw new Error("useAuthGuard must be used within AuthGuardProvider");
  return context;
}

type AuthGuardProviderProps = {
  children?: React.ReactNode;
};

export function AuthGuardProvider({ children }: AuthGuardProviderProps) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineUserId, setOfflineUserId] = useState<string | undefined>(undefined);
  const [isCheckingOffline, setIsCheckingOffline] = useState(false);

  const { data, isLoading, error, refetch } = authApiHook.useGetCurrentUser(isOnline);
  const hasOnlineAuth = !!data?.data?.id && !error;

  // Store userId when successfully fetched online
  useEffect(() => {
    if (data?.data?.id && isOnline) {
      settingApi
        .upsert({
          name: CURRENT_USER_KEY,
          value: data.data,
        })
        .catch((err) => console.error("Failed to store currentUserId:", err));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data?.id, isOnline]);

  // Check offline auth when needed
  useEffect(() => {
    const checkOfflineAuth = async () => {
      if (isOnline && hasOnlineAuth) {
        setOfflineUserId(undefined);
        return;
      }

      if (!isOnline || error) {
        setIsCheckingOffline(true);
        try {
          const userId = await getCurrentUserIdFromSettings();
          setOfflineUserId(userId);
        } catch (err) {
          console.error("Failed to get offline userId:", err);
          setOfflineUserId(undefined);
        } finally {
          setIsCheckingOffline(false);
        }
      }
    };

    checkOfflineAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, hasOnlineAuth]);

  // Network status listeners
  useEffect(() => {
    verifyNetworkStatus(
      (res) => setIsOnline(res),
      () => setIsOnline(false)
    );

    const handleOnline = () => {
      setIsOnline(true);
      refetch();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refetch]);

  // Determine auth state
  const isAuthenticated = isOnline ? hasOnlineAuth : !!offlineUserId;
  const userId = isOnline ? data?.data?.id : offlineUserId;
  const finalIsLoading = (isOnline && isLoading) || (!isOnline && isCheckingOffline);

  if (finalIsLoading && !data && !offlineUserId) return <AuthGuardLoader />;

  return (
    <AuthGuardContext.Provider
      value={{
        isOnline,
        isAuthenticated,
        userId,
        isLoading: finalIsLoading,
        error: error?.message,
        invalidate: () => {
          refetch();
        },
      }}
    >
      {children}
    </AuthGuardContext.Provider>
  );
}

export function AuthGuard({
  children,
  mustNotAuthenticated = false,
}: {
  children?: React.ReactNode;
  mustNotAuthenticated?: boolean;
}) {
  const { isAuthenticated, isLoading, error } = useAuthGuard();

  const navigate = useNavigate();
  useEffect(() => {
    if (isLoading) return;

    if (mustNotAuthenticated && isAuthenticated) {
      navigate(ROUTES.HOME);
      return;
    }

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
  }, [error, isLoading, mustNotAuthenticated, navigate, isAuthenticated]);

  if (isLoading || (!mustNotAuthenticated && !isAuthenticated)) return <AuthGuardLoader />;

  return <>{children ?? <Outlet />}</>;
}

export function AuthGuardLoader() {
  return (
    <>
      <div className="flex justify-center items-center h-screen w-screen">
        <img
          src="/logo.png"
          alt="Logo"
          width={100}
          height={100}
          className={cn("animate-scale-pulse w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32")}
        />
      </div>
    </>
  );
}
