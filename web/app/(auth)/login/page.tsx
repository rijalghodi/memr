"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { IconGoogle } from "@/components/ui/icon-google";
import { toast } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import { auth } from "@/lib/firebase";
import { setAuthCookie } from "@/lib/auth-cookie";
import { useGoogleOAuth } from "@/service/api-auth";
import logo from "@/public/logo-long.png";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: googleOAuth, isPending } = useGoogleOAuth({
    onSuccess: (data) => {
      if (data.data) {
        const {
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        } = data.data;

        setAuthCookie({
          accessToken,
          refreshToken,
          accessTokenExpires: accessTokenExpiresAt,
          refreshTokenExpires: refreshTokenExpiresAt,
        });

        toast.success("Successfully logged in!");
        router.push(ROUTES.HOME);
      }
    },
    onError: (error) => {
      toast.error(error || "Failed to login with Google");
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      googleOAuth({ idToken });
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Failed to sign in with Google");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-6">
        <Image src={logo} alt="Memr Logo" width={100} height={40} priority />
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {BRAND.APP_TAGLINE}
            </h1>
            <p className="text-lg text-muted-foreground">
              Log in to your Memr account
            </p>
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline"
            size="lg"
            className="px-8!"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isPending}
          >
            <IconGoogle size={20} />
            {isPending ? "Signing in..." : "Continue with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
