import { cookies } from "next/headers";
import { SESSION_COOKIE, REFRESH_COOKIE, REMEMBER_ME_COOKIE } from "./cookieNames";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 900; // must match identity-service ACCESS_TOKEN_TTL_SECONDS
const REMEMBER_ME_REFRESH_TOKEN_MAX_AGE_SECONDS = 7776000; // must match identity-service REMEMBER_ME_REFRESH_TOKEN_TTL_SECONDS (90 days)

/**
 * Only callable from a Server Action or Route Handler — Next.js forbids
 * cookie writes elsewhere. `rememberMe` controls the refresh cookie only:
 * unchecked -> a session cookie (no maxAge — gone when the browser closes,
 * though silent refresh in proxy.ts keeps the user signed in for as long as
 * that browser session stays open); checked -> persists 90 days across
 * browser restarts. The access-token cookie's lifetime never changes either
 * way — it's always short-lived by design and gets silently refreshed.
 */
export async function setSessionCookies(accessToken: string, refreshToken: string, rememberMe: boolean) {
  const jar = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  jar.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: REMEMBER_ME_REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });

  // Mirrors the refresh cookie's own persistence so it expires in sync —
  // read back by actions/restaurants/* to echo rememberMe on subsequent
  // identity-service calls without needing to re-derive it.
  jar.set(REMEMBER_ME_COOKIE, rememberMe ? "1" : "0", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: REMEMBER_ME_REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });
}
