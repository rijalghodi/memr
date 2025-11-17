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
  undefined,
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

  if (isLoading)
    return (
      <>
        {process.env.NEXT_PUBLIC_DEBUG === "true" && (
          <DebugInfo
            data={{ data: data, isLoading, error: (error as any)?.message }}
          />
        )}

        <div className="flex justify-center items-center h-screen w-screen">
          <Image
            src={Logo.src}
            alt="Logo"
            width={100}
            height={100}
            className={cn(
              "animate-scale-pulse w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
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
      {process.env.NEXT_PUBLIC_DEBUG === "true" && (
        <DebugInfo data={{ data, isLoading, error: error?.message }} />
      )}
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
  const pathname = usePathname();
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
        {process.env.NEXT_PUBLIC_DEBUG === "true" && (
          <DebugInfo
            data={{
              isLoading,
              isAuthenticated,
              error: (error as any)?.message,
              pathname,
              mustNotAuthenticated,
            }}
            position="right-top"
          />
        )}
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-full max-w-md p-6">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </>
    );

  return (
    <>
      {process.env.NEXT_PUBLIC_DEBUG === "true" && (
        <DebugInfo
          data={{
            isLoading,
            isAuthenticated,
            error: (error as any)?.message,
            pathname,
            mustNotAuthenticated,
          }}
          position="right-top"
        />
      )}
      {children}
    </>
  );
}

function DebugInfo({
  data,
  position = "left-top",
}: {
  data: any;
  position?: "left-top" | "right-top" | "left-bottom" | "right-bottom";
}) {
  return (
    <pre
      className={cn(
        "fixed bg-background/50 p-2 rounded-md z-0 w-[300px] h-auto text-xs overflow-auto",
        position === "left-top" && "left-4 top-4",
        position === "right-top" && "right-4 top-4",
        position === "left-bottom" && "left-4 bottom-4",
        position === "right-bottom" && "right-4 bottom-4",
      )}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
