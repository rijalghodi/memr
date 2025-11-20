"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { toast } from "@/components/ui";
import { setAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.png";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Both searchParams and router are considered always available in Next.js app router
  // Defensive: check tokens only after both are present
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
    window.location.reload();
  }, []);

  return (
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
  );
}
