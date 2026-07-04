/**
 * Stats cache.
 *
 * Exposes a single, backend-agnostic interface — {@link getCachedStats} /
 * {@link setCachedStats} — over two implementations chosen at runtime:
 *
 *   - **Upstash Redis** when its REST env vars are present (production). This
 *     covers Vercel KV, the Vercel Marketplace "Upstash" integration, and a
 *     plain Upstash database — we accept either env-var naming convention.
 *   - **In-memory Map** otherwise (local dev / tests). Values live for the
 *     lifetime of the server process only.
 *
 * Entries carry their own timestamp and we enforce a TTL on read, so a stale
 * entry is treated as a miss even if the backend keeps it around.
 *
 * Server-only module.
 */

import type { GitHubStats } from "@/lib/types";

/** Time-to-live for a cached stats entry (ms). */
export const STATS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
/** TTL in whole seconds, for backends that expect seconds (KV `ex`). */
export const STATS_TTL_SECONDS = Math.floor(STATS_TTL_MS / 1000);

/** Envelope stored in the cache: the stats plus when they were written. */
interface CacheEntry {
  stats: GitHubStats;
  /** Unix epoch millis when this entry was cached. */
  cachedAt: number;
}

/** Namspaced cache key for a handle (lowercased for case-insensitivity). */
function cacheKey(username: string): string {
  return `devquest:stats:${username.toLowerCase()}`;
}

/**
 * Resolve Redis REST credentials from the environment.
 *
 * Supports both naming conventions so the same code works across:
 *   - Vercel KV / Vercel Marketplace Upstash → `KV_REST_API_URL` / `KV_REST_API_TOKEN`
 *   - A plain Upstash Redis database         → `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
 *
 * @returns the `{ url, token }` pair when both are present, else `null`.
 */
function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/** True when a Redis backend is configured. */
function redisConfigured(): boolean {
  return redisCredentials() !== null;
}

/** Whether an entry is still within its TTL. */
function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.cachedAt < STATS_TTL_MS;
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, CacheEntry>();

function memGet(key: string): CacheEntry | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (!isFresh(entry)) {
    memoryStore.delete(key);
    return null;
  }
  return entry;
}

function memSet(key: string, entry: CacheEntry): void {
  memoryStore.set(key, entry);
}

// ---------------------------------------------------------------------------
// Upstash Redis (lazy import + memoized client so the dep is only loaded when
// configured, and we don't rebuild the client on every request).
// ---------------------------------------------------------------------------

/** Memoized client promise; keyed implicitly by process env at first use. */
let redisClientPromise: Promise<import("@upstash/redis").Redis> | null = null;

async function getRedis(): Promise<import("@upstash/redis").Redis> {
  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const creds = redisCredentials();
      if (!creds) throw new Error("Redis credentials not configured");
      const { Redis } = await import("@upstash/redis");
      // Explicit url/token (rather than fromEnv) so either env naming works.
      return new Redis({ url: creds.url, token: creds.token });
    })();
  }
  return redisClientPromise;
}

async function redisGet(key: string): Promise<CacheEntry | null> {
  const redis = await getRedis();
  // @upstash/redis deserializes JSON automatically → returns the object.
  const entry = await redis.get<CacheEntry>(key);
  if (!entry) return null;
  if (!isFresh(entry)) return null;
  return entry;
}

async function redisSet(key: string, entry: CacheEntry): Promise<void> {
  const redis = await getRedis();
  // Also let Redis expire it server-side as a backstop to the read-time TTL.
  await redis.set(key, entry, { ex: STATS_TTL_SECONDS });
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

/**
 * Read cached stats for a handle.
 *
 * @returns the cached {@link GitHubStats} when present and fresh, else `null`.
 *          Never throws — a backend failure degrades to a cache miss.
 */
export async function getCachedStats(
  username: string,
): Promise<GitHubStats | null> {
  const key = cacheKey(username);
  try {
    const entry = redisConfigured() ? await redisGet(key) : memGet(key);
    return entry?.stats ?? null;
  } catch (error) {
    console.error("[cache] read failed, treating as miss:", error);
    return null;
  }
}

/**
 * Write stats for a handle into the cache.
 *
 * Never throws — a backend failure is logged and swallowed so it can't break
 * the request that produced fresh data.
 */
export async function setCachedStats(
  username: string,
  stats: GitHubStats,
): Promise<void> {
  const key = cacheKey(username);
  const entry: CacheEntry = { stats, cachedAt: Date.now() };
  try {
    if (redisConfigured()) {
      await redisSet(key, entry);
    } else {
      memSet(key, entry);
    }
  } catch (error) {
    console.error("[cache] write failed, ignoring:", error);
  }
}

/**
 * Remove a cached stats entry by username.
 * Never throws — failures are logged.
 */
export async function clearCachedStats(username: string): Promise<void> {
  const key = cacheKey(username);
  try {
    if (redisConfigured()) {
      const redis = await getRedis();
      await redis.del(key);
    } else {
      memoryStore.delete(key);
    }
  } catch (error) {
    console.error("[cache] delete failed, ignoring:", error);
  }
}
