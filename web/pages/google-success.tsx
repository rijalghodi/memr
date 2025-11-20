import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { toast } from "@/components/ui";
import { setAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.png";

export function GoogleSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      toast.error("No access token or refresh token found");
      navigate(ROUTES.LOGIN);
      return;
    }

    setAuthCookie({
      accessToken: accessToken ?? "",
      refreshToken: refreshToken ?? "",
      accessTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      refreshTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    toast.success("Successfully logged in!");
    navigate(ROUTES.HOME);
    window.location.reload();
  }, [accessToken, refreshToken, navigate]);

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <img
        src={Logo}
        alt="Logo"
        width={100}
        height={100}
        className={cn(
          "animate-scale-pulse w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
        )}
      />
    </div>
  );
}
