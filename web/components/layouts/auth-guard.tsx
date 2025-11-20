"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

import { Skeleton, toast } from "@/components/ui";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.png";
import { authApiHook } from "@/service/api-auth";

type AuthGuardContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
  invalidate: () => void;
};

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(
  undefined
);

export function useAuthGuard() {
  const context = useContext(AuthGuardContext);
  if (context === undefined)
    throw new Error("useAuthGuard must be used within AuthGuardProvider");
  return context;
}

type AuthGuardProviderProps = {
  children: React.ReactNode;
};

export function AuthGuardProvider({ children }: AuthGuardProviderProps) {
  const { data, isLoading, error, refetch } = authApiHook.useGetCurrentUser();

  if (isLoading && !data)
    return (
      <>
        <div className="flex justify-center items-center h-screen w-screen">
          <Image
            src={Logo.src}
            alt="Logo"
            width={100}
            height={100}
            className={cn(
              "animate-scale-pulse w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
            )}
          />
        </div>
      </>
    );

  return (
    <AuthGuardContext.Provider
      value={{
        isAuthenticated: !!data?.data?.id,
        isLoading,
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
  children: React.ReactNode;
  mustNotAuthenticated?: boolean;
}) {
  const { isAuthenticated, isLoading, error } = useAuthGuard();

  const router = useRouter();
  useEffect(() => {
    if (error) {
      if (mustNotAuthenticated) {
        return;
      } else {
        router.push(ROUTES.LOGIN);
        return;
      }
    }

    if (isLoading) return;

    if (mustNotAuthenticated && isAuthenticated) {
      router.push(ROUTES.HOME);
      return;
    }

    if (!isAuthenticated) {
      toast.error("You are not authenticated", {
        description: "Please login to continue",
      });
      router.push(ROUTES.LOGIN);
      return;
    }
  }, [error, isLoading, mustNotAuthenticated]);

  if (isLoading)
    return (
      <>
        <div className="flex justify-center items-center h-screen w-screen">
          <Image
            src={Logo.src}
            alt="Logo"
            width={100}
            height={100}
            className={cn(
              "animate-scale-pulse w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
            )}
          />
        </div>
      </>
    );

  return <>{children}</>;
}
