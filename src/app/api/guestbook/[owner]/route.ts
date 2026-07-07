/**
 * Guestbook API: /api/guestbook/:owner
 *
 *   GET  → list signatures for an owner (newest first), JSON.
 *   POST → add a signature. Body: { name, message }. JSON or form-encoded.
 *   DELETE → owner-only moderation: remove one entry (?at=ts) or all (?all=1).
 *
 * Storage is backend-agnostic (Upstash Redis in prod, in-memory locally) via
 * {@link @/lib/guestbook}. Writes are validated + sanitized there. This route
 * is intentionally unauthenticated: it's a public wall, like a README visitor
 * counter. Abuse is bounded by per-entry length caps and a capped list length;
 * a light per-request size guard is applied below. If you deploy this publicly
 * and want stronger guarantees, put a rate limiter (e.g. Upstash Ratelimit) in
 * front of the POST handler.
 */

import {
  addEntry,
  getEntries,
  countEntries,
  deleteEntry,
  clearGuestbook,
  isGuestbookDurable,
  GUESTBOOK_MAX,
} from "@/lib/guestbook";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/** Reject absurdly large bodies before parsing (defense in depth). */
const MAX_BODY_BYTES = 4 * 1024;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { owner: string } },
) {
  const owner = params.owner.trim();
  if (!owner) return json({ error: "missing owner" }, 400);

  const [entries, total] = await Promise.all([
    getEntries(owner, GUESTBOOK_MAX),
    countEntries(owner),
  ]);
  return json({ owner, total, entries });
}

export async function POST(
  request: Request,
  { params }: { params: { owner: string } },
) {
  const owner = params.owner.trim();
  if (!owner) return json({ error: "missing owner" }, 400);

  // Size guard.
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_BODY_BYTES) {
    return json({ error: "payload too large" }, 413);
  }

  // Accept JSON or form-encoded bodies.
  let name = "";
  let message = "";
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { name?: unknown; message?: unknown };
      name = typeof body.name === "string" ? body.name : "";
      message = typeof body.message === "string" ? body.message : "";
    } else {
      const form = await request.formData();
      name = String(form.get("name") ?? "");
      message = String(form.get("message") ?? "");
    }
  } catch {
    return json({ error: "invalid body" }, 400);
  }

  const ok = await addEntry(owner, name, message);
  if (!ok) return json({ error: "name required" }, 422);

  const total = await countEntries(owner);
  // Be honest: if no durable backend is configured, the write won't survive
  // across serverless instances. Report it so the client can surface a warning
  // instead of silently losing signatures.
  return json({ ok: true, owner, total, durable: isGuestbookDurable() }, 201);
}

/** The signed-in user's GitHub handle, or null. */
async function currentUsername(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as unknown as { username?: string; name?: string } | undefined;
  return user?.username ?? user?.name ?? null;
}

/**
 * DELETE /api/guestbook/:owner  — owner-only moderation.
 *
 * Removes one signature (`?at=<timestamp>`) or clears the whole wall
 * (`?all=1`). Requires the signed-in GitHub user to match `:owner`, so only the
 * profile owner can moderate their own guestbook.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { owner: string } },
) {
  const owner = params.owner.trim();
  if (!owner) return json({ error: "missing owner" }, 400);

  // AuthZ: the caller must be the owner of this wall.
  const me = await currentUsername();
  if (!me) return json({ error: "not authenticated" }, 401);
  if (me.toLowerCase() !== owner.toLowerCase()) {
    return json({ error: "forbidden — not your guestbook" }, 403);
  }

  const url = new URL(request.url);
  if (url.searchParams.get("all") === "1") {
    const ok = await clearGuestbook(owner);
    return json({ ok, owner, total: 0 });
  }

  const at = Number(url.searchParams.get("at"));
  if (!Number.isFinite(at)) {
    return json({ error: "missing or invalid 'at'" }, 400);
  }
  const ok = await deleteEntry(owner, at);
  if (!ok) return json({ error: "entry not found" }, 404);

  const total = await countEntries(owner);
  return json({ ok: true, owner, total });
}
