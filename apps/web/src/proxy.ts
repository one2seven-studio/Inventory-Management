import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, REFRESH_COOKIE, REMEMBER_ME_COOKIE } from "./lib/session/cookieNames";
import { config as appConfig } from "./lib/config";

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};

// Must match identity-service's ACCESS_TOKEN_TTL_SECONDS / REMEMBER_ME_REFRESH_TOKEN_TTL_SECONDS
// and apps/web/src/lib/session/setSessionCookies.ts — duplicated here because
// Middleware uses NextRequest/NextResponse's cookie API, not next/headers'
// cookies(), which setSessionCookies relies on and can't be called from here.
const ACCESS_TOKEN_MAX_AGE_SECONDS = 900;
const REMEMBER_ME_REFRESH_TOKEN_MAX_AGE_SECONDS = 7776000;

interface RefreshResponseBody {
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
}

/**
 * Gate every page except /login behind a session. The access-token cookie's
 * own maxAge is set to match its JWT's expiry exactly, so its absence *is*
 * "expired" — when that happens but a refresh token is still present, this
 * attempts a silent refresh before falling back to a login redirect. This
 * is what actually keeps a signed-in user working for longer than 15
 * minutes at a stretch (remember-me or not) — nothing else in this app
 * renews the access token. Real authorization still happens at the
 * gateway/services regardless of what happens here.
 */
export async function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const response = await fetch(new URL("/api/v1/identity/auth/refresh", appConfig.gatewayUrl), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const result = (await response.json()) as RefreshResponseBody;
        const isProduction = process.env.NODE_ENV === "production";

        // Set on the request too so this same request's Server Component
        // render sees the refreshed token immediately, not just future ones.
        request.cookies.set(SESSION_COOKIE, result.accessToken);
        const nextResponse = NextResponse.next({ request });

        nextResponse.cookies.set(SESSION_COOKIE, result.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
        });
        nextResponse.cookies.set(REFRESH_COOKIE, result.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          ...(result.rememberMe ? { maxAge: REMEMBER_ME_REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
        });
        nextResponse.cookies.set(REMEMBER_ME_COOKIE, result.rememberMe ? "1" : "0", {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          ...(result.rememberMe ? { maxAge: REMEMBER_ME_REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
        });
        return nextResponse;
      }
    } catch {
      // Gateway unreachable or refresh token invalid/expired — fall through to login.
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
