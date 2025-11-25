import { Button } from "@/components/ui/button";
import { IconGoogle } from "@/components/ui/icon-google";
import { BRAND } from "@/lib/brand";

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-sidebar">
      {/* Logo in top left corner */}

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Heading */}
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt={BRAND.APP_NAME} width={150} height={60} />
            </div>
            {/* Gradient heading from var(--brand-1) to var(--brand-2) */}
            <h1 className="text-3xl font-semibold bg-linear-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
              {BRAND.APP_TAGLINE}
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-base">Log in to your Memr account</p>
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

          {/* Background gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed right-0 top-0 z-0 translate-x-full sm:translate-x-1/2 -translate-y-1/2 h-[600px] w-[400px] rounded-full blur-[120px] opacity-80"
            style={{
              background: "radial-gradient(circle at center, var(--brand-1) 0%, transparent 70%)",
              filter: "blur(100px) drop-shadow(0 0 100px var(--brand-1))",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed left-0 bottom-0 z-0 -translate-x-full sm:-translate-x-1/2 translate-y-1/2 h-[600px] w-[400px] rounded-full blur-[120px] opacity-80"
            style={{
              background: "radial-gradient(circle at center, var(--brand-2) 0%, transparent 70%)",
              filter: "blur(100px) drop-shadow(0 0 100px var(--brand-2))",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const loginWithGoogle = () => {
  // const params = new URLSearchParams({
  //   client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID!,
  //   redirect_uri: import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI!,
  //   response_type: "code",
  //   scope: "openid email profile",
  //   access_type: "offline", // get refresh token
  //   prompt: "consent", // ensures refresh token in local dev
  // });

  // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/v1/auth/google/login`;
};
