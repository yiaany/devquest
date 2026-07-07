/**
 * Edge middleware — cache-safety for personalized responses.
 *
 * Root cause it guards against: a personalized response (notably
 * `/api/auth/session`, which carries the signed-in user's identity) getting
 * cached by a CDN/proxy and then served to a *different* visitor — which is how
 * one user can appear to be "logged in as" someone else.
 *
 * We force `Cache-Control: no-store` and mark `Vary: Cookie` on all auth and
 * API responses so no shared cache may ever reuse them across users. This is
 * defense-in-depth on top of NextAuth's own headers.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();

  const path = request.nextUrl.pathname;
  // Never cache anything that depends on the caller's session/cookies.
  const isSensitive =
    path.startsWith("/api/auth") ||
    path.startsWith("/api/guestbook") ||
    path.startsWith("/api/refresh");

  if (isSensitive) {
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    res.headers.set("Vary", "Cookie, Authorization");
    res.headers.set("Pragma", "no-cache");
  }

  return res;
}

export const config = {
  // Run on auth + API routes. The public SVG card endpoint is intentionally
  // excluded so it can still be cached by GitHub's image proxy.
  matcher: ["/api/auth/:path*", "/api/guestbook/:path*", "/api/refresh/:path*"],
};