import { sendSignInLinkToEmail } from "firebase/auth";
import React, { useState } from "react";

import { Button, Input } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { ROUTES } from "@/lib/routes";

// Firebase remembers the email locally so the completion page (opened from
// the emailed link, possibly in a different tab/session) doesn't have to
// ask the user to retype it.
const MAGIC_LINK_EMAIL_KEY = "memr.magic-link-email";

type Props = {};

export function LoginWithMagicLink({}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}${ROUTES.MAGIC_LINK_FINISH}`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(MAGIC_LINK_EMAIL_KEY, email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send sign-in link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center text-sm text-muted-foreground">
        We sent a sign-in link to <span className="font-medium">{email}</span>. Open it on this
        device to finish logging in.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="magic-link-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="magic-link-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full" variant="outline-primary" size="lg">
          {loading ? "Sending link..." : "Email me a login link"}
        </Button>
      </form>
    </div>
  );
}

export { MAGIC_LINK_EMAIL_KEY };
