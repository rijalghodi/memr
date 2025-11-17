import Cookies from "js-cookie";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constant";

function addSecondsToCurrentDate(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

function setCookieWithExpiration(
  key: string,
  value: string,
  expires?: string | Date | number,
) {
  const expiresDate =
    typeof expires === "number"
      ? addSecondsToCurrentDate(expires)
      : expires
        ? new Date(expires)
        : undefined;

  Cookies.set(key, value, {
    expires: expiresDate,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
}

type AuthCookie = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpires?: string | Date | number;
  refreshTokenExpires?: string | Date | number;
};

export function setAuthCookie({
  accessToken,
  refreshToken,
  accessTokenExpires,
  refreshTokenExpires,
}: AuthCookie) {
  setCookieWithExpiration(ACCESS_TOKEN_KEY, accessToken, accessTokenExpires);

  if (refreshToken) {
    setCookieWithExpiration(
      REFRESH_TOKEN_KEY,
      refreshToken,
      refreshTokenExpires,
    );
  }
}

export function removeAuthCookie() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}
