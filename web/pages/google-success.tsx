import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthGuardLoader } from "@/components/layouts/auth-guard";
import { toast } from "@/components/ui";
import { setAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";

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

  return <AuthGuardLoader />;
}
