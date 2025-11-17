"use client";

import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { IconGoogle } from "@/components/ui/icon-google";
import { setAuthCookie } from "@/lib/auth-cookie";
import { BRAND } from "@/lib/brand";
import { auth } from "@/lib/firebase";
import { ROUTES } from "@/lib/routes";
import logo from "@/public/logo-long.png";
import { useGoogleOAuth } from "@/service/api-auth";
import { useEffect } from "react";

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
