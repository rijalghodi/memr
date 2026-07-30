import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeFirebaseLogin } from "@/components/auth/firebase-login";
import { MAGIC_LINK_EMAIL_KEY } from "@/components/auth/login-w-magic-link";
import { AuthGuardLoader } from "@/components/layouts/auth-guard";
import { Button, Input, toast } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { ROUTES } from "@/lib/routes";

export function MagicLinkFinishPage() {
  const navigate = useNavigate();
  const ranOnce = useRef(false);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const finish = async (email: string) => {
    try {
      const userCredential = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem(MAGIC_LINK_EMAIL_KEY);

      await completeFirebaseLogin(userCredential);

      toast.success("Successfully logged in!");
      navigate(ROUTES.HOME);
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "This sign-in link is invalid or has expired.");
    }
  };

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setError("This isn't a valid sign-in link.");
      return;
    }

    const storedEmail = window.localStorage.getItem(MAGIC_LINK_EMAIL_KEY);
    if (storedEmail) {
      finish(storedEmail);
    } else {
      // Link opened on a different device/browser than it was requested on.
      setNeedsEmail(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (needsEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form
          className="w-full max-w-md space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            finish(emailInput);
          }}
        >
          <p className="text-sm text-muted-foreground">
            Confirm the email you requested this login link with.
          </p>
          <Input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            placeholder="you@example.com"
          />
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg">
            Continue
          </Button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.LOGIN)}>
          Back to login
        </Button>
      </div>
    );
  }

  return <AuthGuardLoader />;
}
