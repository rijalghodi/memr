"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { toast } from "@/components/ui";
import { setAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      toast.error("No access token or refresh token found");
      router.push(ROUTES.LOGIN);
      return;
    }

    setAuthCookie({
      accessToken: accessToken ?? "",
      refreshToken: refreshToken ?? "",
      accessTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      refreshTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    toast.success("Successfully logged in!");
    router.push(ROUTES.HOME);
  }, []);

  return (
    <div>
      <h1>Google Success</h1>
    </div>
  );
}
