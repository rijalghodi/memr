"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { IconGoogle } from "@/components/ui/icon-google";
import { BRAND } from "@/lib/brand";
import logo from "@/public/logo-long.png";

export default function LoginPage() {
  // const router = useRouter();
  // const { mutate: googleOAuth, isPending } = useGoogleOAuth({
  //   onSuccess: (data) => {
  //     if (data.data) {
  //       const {
  //         accessToken,
  //         refreshToken,
  //         accessTokenExpiresAt,
  //         refreshTokenExpiresAt,
  //       } = data.data;

  //       setAuthCookie({
  //         accessToken,
  //         refreshToken,
  //         accessTokenExpires: accessTokenExpiresAt,
  //         refreshTokenExpires: refreshTokenExpiresAt,
  //       });

  //       toast.success("Successfully logged in!");
  //       router.push(ROUTES.HOME);
  //     }
  //   },
  //   onError: (error) => {
  //     toast.error(error || "Failed to login with Google");
  //   },
  // });

  // const handleGoogleLogin = async () => {
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     signInWithRedirect(auth, provider);
  //   } catch (error: any) {
  //     if (error.code !== "auth/popup-closed-by-user") {
  //       toast.error(error.message || "Failed to sign in with Google");
  //     }
  //   }
  // };

  // useEffect(() => {
  //   const performGoogleOAuth = async () => {
  //     const result = await getRedirectResult(auth);
  //     if (!result) return;
  //     const idToken = await result.user.getIdToken();
  //     googleOAuth({ idToken });
  //   };
  //   performGoogleOAuth();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-sidebar">
      {/* Logo in top left corner */}

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Heading */}
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <Image
                src={logo}
                alt={BRAND.APP_NAME}
                width={150}
                height={60}
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {BRAND.APP_TAGLINE}
            </h1>
            <p className="text-lg text-muted-foreground">
              Log in to your Memr account
            </p>
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline-primary"
            size="lg"
            className="px-10! rounded-full"
            type="button"
            onClick={loginWithGoogle}
          >
            <IconGoogle size={20} />
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export const loginWithGoogle = () => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline", // get refresh token
    prompt: "consent", // ensures refresh token in local dev
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};
