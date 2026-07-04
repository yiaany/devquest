/**
 * Cache invalidation endpoint: POST /api/refresh
 *
 * Clears the cached statistics for a given user handle so the next fetch pulls
 * fresh data from GitHub.
 *
 * Security:
 *   - Authenticated user can refresh their *own* cache only.
 *   - Alternatively, a request with a valid `API_REFRESH_SECRET` header can
 *     refresh any handle (used by the GitHub Action cron).
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    if (!username || typeof username !== "string") {
      return Response.json({ error: "missing_username" }, { status: 400 });
    }

    // Auth check:
    const session = await getServerSession(authOptions);
    const authUsername = (session?.user as unknown as { username?: string })?.username;

    const authHeader = request.headers.get("x-devquest-secret");
    const cronSecret = process.env.API_REFRESH_SECRET;
    const isCronAuthorized = cronSecret && authHeader === cronSecret;

    const isOwner = authUsername && authUsername.toLowerCase() === username.toLowerCase();

    if (!isOwner && !isCronAuthorized) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    // Clear cache by overriding with null/stale check, or just deleting key.
    // In our cache layer, we can delete the key from Redis/memory.
    // Let's implement a clean delete in cache.ts or just set stats to null.
    // Setting setCachedStats with null isn't allowed by types, so let's add
    // a clearCachedStats helper in cache.ts.
    const { clearCachedStats } = await import("@/lib/cache");
    await clearCachedStats(username);

    return Response.json({ success: true, username });
  } catch (error) {
    console.error("[api/refresh] failed:", error);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
