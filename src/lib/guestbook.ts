/**
 * Guestbook storage.
 *
 * Backs the interactive Guestbook card: visitors leave a short signed message
 * on a profile owner's wall. Storage mirrors {@link ./cache} — Upstash Redis in
 * production (a capped list per owner), an in-memory Map for local dev/tests.
 *
 * Entries are validated and sanitized before write (length caps, control-char
 * stripping) so a card render from this data is always safe and bounded.
 *
 * Server-only module. Never throws on backend failure — reads degrade to an
 * empty wall, writes surface a boolean so the API can report success.
 */

/** A single guestbook signature. */
export interface GuestbookEntry {
  /** Display name / handle of the signer (sanitized, <= 32 chars). */
  name: string;
  /** Optional short message (sanitized, <= 100 chars). */
  message: string;
  /** Unix epoch millis when signed. */
  at: number;
}

/** Max signatures retained per owner (the wall is a rolling window). */
export const GUESTBOOK_MAX = 100;
/** Max entries a single card render will display. */
export const GUESTBOOK_RENDER_LIMIT = 12;
const NAME_MAX = 32;
const MESSAGE_MAX = 100;

/** Namespaced key for an owner's guestbook list. */
function guestbookKey(owner: string): string {
  return `devquest:guestbook:${owner.toLowerCase()}`;
}

/** Strip control chars and collapse whitespace; clamp to `max`. */
function sanitize(input: string, max: number): string {
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Validate + normalize a raw signing request.
 * @returns a clean {@link GuestbookEntry}, or `null` if the name is empty.
 */
export function normalizeEntry(rawName: string, rawMessage: string): GuestbookEntry | null {
  const name = sanitize(rawName ?? "", NAME_MAX);
  if (!name) return null;
  const message = sanitize(rawMessage ?? "", MESSAGE_MAX);
  return { name, message, at: Date.now() };
}

// --- Redis creds (same dual-convention resolution as the stats cache) -------

function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

function redisConfigured(): boolean {
  return redisCredentials() !== null;
}

/**
 * Whether a durable (shared) backend is configured.
 *
 * In production on serverless (Vercel), the in-memory fallback is NOT durable:
 * each request may hit a different, short-lived instance, so a write on one is
 * invisible to the next read. Callers use this to warn/behave correctly when
 * persistence isn't actually available.
 */
export function isGuestbookDurable(): boolean {
  return redisConfigured();
}

let redisClientPromise: Promise<import("@upstash/redis").Redis> | null = null;

async function getRedis(): Promise<import("@upstash/redis").Redis> {
  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const creds = redisCredentials();
      if (!creds) throw new Error("Redis credentials not configured");
      const { Redis } = await import("@upstash/redis");
      return new Redis({ url: creds.url, token: creds.token });
    })();
  }
  return redisClientPromise;
}

// --- In-memory fallback -----------------------------------------------------

const memoryStore = new Map<string, GuestbookEntry[]>();

// --- Public interface -------------------------------------------------------

/**
 * Append a signature to an owner's guestbook, trimming to {@link GUESTBOOK_MAX}.
 * @returns `true` on success, `false` if the entry was invalid or write failed.
 */
export async function addEntry(
  owner: string,
  rawName: string,
  rawMessage: string,
): Promise<boolean> {
  const entry = normalizeEntry(rawName, rawMessage);
  if (!entry) return false;

  const key = guestbookKey(owner);
  try {
    if (redisConfigured()) {
      const redis = await getRedis();
      // Newest first; cap the list.
      await redis.lpush(key, JSON.stringify(entry));
      await redis.ltrim(key, 0, GUESTBOOK_MAX - 1);
    } else {
      const list = memoryStore.get(key) ?? [];
      list.unshift(entry);
      memoryStore.set(key, list.slice(0, GUESTBOOK_MAX));
    }
    return true;
  } catch (error) {
    console.error("[guestbook] write failed:", error);
    return false;
  }
}

/**
 * Read an owner's guestbook, newest first.
 * @param limit max entries to return (defaults to {@link GUESTBOOK_MAX}).
 * @returns the entries, or `[]` on any failure.
 */
export async function getEntries(
  owner: string,
  limit: number = GUESTBOOK_MAX,
): Promise<GuestbookEntry[]> {
  const key = guestbookKey(owner);
  try {
    if (redisConfigured()) {
      const redis = await getRedis();
      const raw = await redis.lrange(key, 0, Math.max(0, limit - 1));
      return raw
        .map((r) => {
          // @upstash/redis may already deserialize; handle both.
          if (typeof r === "object" && r !== null) return r as GuestbookEntry;
          try {
            return JSON.parse(r as string) as GuestbookEntry;
          } catch {
            return null;
          }
        })
        .filter((e): e is GuestbookEntry => !!e && typeof e.name === "string");
    }
    return (memoryStore.get(key) ?? []).slice(0, limit);
  } catch (error) {
    console.error("[guestbook] read failed, empty wall:", error);
    return [];
  }
}

/** Count of signatures for an owner (capped at {@link GUESTBOOK_MAX}). */
export async function countEntries(owner: string): Promise<number> {
  const key = guestbookKey(owner);
  try {
    if (redisConfigured()) {
      const redis = await getRedis();
      return await redis.llen(key);
    }
    return (memoryStore.get(key) ?? []).length;
  } catch {
    return 0;
  }
}

/**
 * Delete a single signature from an owner's wall, identified by its `at`
 * timestamp (unique enough per owner for moderation). Used by the owner-only
 * moderation endpoint.
 *
 * @returns `true` if an entry was removed, `false` otherwise.
 */
export async function deleteEntry(owner: string, at: number): Promise<boolean> {
  if (!Number.isFinite(at)) return false;
  const key = guestbookKey(owner);
  try {
    if (redisConfigured()) {
      const redis = await getRedis();
      // Read the current list, drop the matching entry, rewrite atomically-ish.
      const raw = await redis.lrange(key, 0, GUESTBOOK_MAX - 1);
      const kept: string[] = [];
      let removed = false;
      for (const r of raw) {
        const parsed =
          typeof r === "object" && r !== null
            ? (r as GuestbookEntry)
            : (() => {
                try {
                  return JSON.parse(r as string) as GuestbookEntry;
                } catch {
                  return null;
                }
              })();
        if (parsed && parsed.at === at && !removed) {
          removed = true;
          continue;
        }
        // Preserve original serialization for surviving entries.
        kept.push(typeof r === "string" ? r : JSON.stringify(r));
      }
      if (!removed) return false;
      // Replace the list: delete then re-push in original order (newest first).
      const multi = redis.multi();
      multi.del(key);
      if (kept.length > 0) {
        // rpush preserves order; kept is already newest-first.
        multi.rpush(key, ...kept);
      }
      await multi.exec();
      return true;
    }
    const list = memoryStore.get(key) ?? [];
    const next = list.filter((e) => e.at !== at);
    if (next.length === list.length) return false;
    memoryStore.set(key, next);
    return true;
  } catch (error) {
    console.error("[guestbook] delete failed:", error);
    return false;
  }
}

/**
 * Clear an owner's entire guestbook. Owner-only.
 * @returns `true` on success.
 */
export async function clearGuestbook(owner: string): Promise<boolean> {
  const key = guestbookKey(owner);
  try {
    if (redisConfigured()) {
      const redis = await getRedis();
      await redis.del(key);
    } else {
      memoryStore.delete(key);
    }
    return true;
  } catch (error) {
    console.error("[guestbook] clear failed:", error);
    return false;
  }
}
