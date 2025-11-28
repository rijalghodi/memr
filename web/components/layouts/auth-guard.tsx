import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { toast } from "@/components/ui";
import { ROUTES } from "@/lib/routes";
import { getCurrentUserIdFromSettings } from "@/lib/user-id";
import { cn } from "@/lib/utils";
import { authApiHook } from "@/service/api-auth";

type AuthGuardContextType = {
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
  const { data, isLoading, error, refetch } = authApiHook.useGetCurrentUser();
  const [offlineUserId, setOfflineUserId] = useState<string | undefined>(undefined);
  const [isCheckingOffline, setIsCheckingOffline] = useState(false);

  // Check offline authentication when online check fails or when offline
  useEffect(() => {
    const checkOfflineAuth = async () => {
      const isOnline = navigator.onLine;
      const hasOnlineAuth = !!data?.data?.id && !error;

      // If online and authenticated, use online auth
      if (isOnline && hasOnlineAuth) {
        setOfflineUserId(undefined);
        setIsCheckingOffline(false);
        return;
      }

      // If offline or online auth failed, check settings
      if (!isOnline || (!hasOnlineAuth && error)) {
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
  }, [data?.data?.id, error, isLoading]);

  // Determine authentication state
  const isOnline = navigator.onLine;
  const hasOnlineAuth = !!data?.data?.id && !error;
  const hasOfflineAuth = !!offlineUserId;
  const isAuthenticated = isOnline ? hasOnlineAuth : hasOfflineAuth;
  const userId = isOnline ? data?.data?.id : offlineUserId;
  const finalIsLoading = isLoading || (isCheckingOffline && !isOnline);

  if (finalIsLoading && !data && !offlineUserId) return <AuthGuardLoader />;

  return (
    <AuthGuardContext.Provider
      value={{
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
    if (error) {
      if (mustNotAuthenticated) {
        return;
      } else {
        navigate(ROUTES.LOGIN);
        return;
      }
    }

    if (isLoading) return;

    if (mustNotAuthenticated && isAuthenticated) {
      navigate(ROUTES.HOME);
      return;
    }

    if (!isAuthenticated) {
      toast.error("You are not authenticated", {
        description: "Please login to continue",
      });
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
