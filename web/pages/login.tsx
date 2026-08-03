import { LoginWithMagicLink } from "@/components/auth/login-w-magic-link";
import { Button } from "@/components/ui/button";
import { IconGoogle } from "@/components/ui/icon-google";
import { BRAND } from "@/lib/brand";

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo in top left corner */}

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-12 text-center">
          {/* Heading */}
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/logo-long.png" alt={BRAND.APP_NAME} width={200} height={200} />
            </div>
            {/* Gradient heading from var(--brand-1) to var(--brand-2) */}
            <h1 className="text-2xl sm:text-3xl font-semibold bg-linear-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
              {BRAND.APP_TAGLINE}
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-base">Log in to your Memr account</p>
            {/* Google Login Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center h-12 rounded-full"
              type="button"
              onClick={loginWithGoogle}
            >
              <IconGoogle size={20} />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="text-left">
              <LoginWithMagicLink />
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center px-6 py-12">
        Made with 💪 by{" "}
        <a
          href={BRAND.AUTHOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {BRAND.AUTHOR}
        </a>
      </div>

      {/* Background gradient with infinite up and down animation */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 z-0 h-[600px] w-[400px] rounded-full blur-[120px] opacity-80 animate-blob-1"
        style={{
          background: "radial-gradient(circle at center, var(--brand-1) 0%, transparent 70%)",
          filter: "blur(100px) drop-shadow(0 0 100px var(--brand-1))",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 bottom-0 z-0 h-[600px] w-[400px] rounded-full blur-[120px] opacity-80 animate-blob-2"
        style={{
          background: "radial-gradient(circle at center, var(--brand-2) 0%, transparent 70%)",
          filter: "blur(100px) drop-shadow(0 0 100px var(--brand-2))",
        }}
      />
    </div>
  );
}

export const loginWithGoogle = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/v1/auth/google/login`;
};
