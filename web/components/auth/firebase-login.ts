import type { UserCredential } from "firebase/auth";

import { setAuthCookie } from "@/lib/auth-cookie";
import { authApi } from "@/service/api-auth";

/**
 * Shared final step for every Firebase-based sign-in method (email/password,
 * magic link, and in future a Firebase-popup Google flow). Takes the
 * Firebase UserCredential, gets its ID token, exchanges it with the backend
 * for this app's access/refresh tokens, and persists them as cookies.
 *
 * Throws if the exchange fails, so callers can handle it in their existing
 * try/catch alongside Firebase errors.
 */
export async function completeFirebaseLogin(userCredential: UserCredential): Promise<void> {
  const idToken = await userCredential.user.getIdToken();

  const res = await authApi.firebaseLogin({ idToken });

  if (!res.data) {
    throw new Error(res.message || "Failed to log in");
  }

  setAuthCookie({
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
    accessTokenExpires: res.data.accessTokenExpiresAt,
    refreshTokenExpires: res.data.refreshTokenExpiresAt,
  });
}
