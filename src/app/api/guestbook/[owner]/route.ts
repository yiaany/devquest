/**
 * Guestbook API: /api/guestbook/:owner
 *
 *   GET  → list signatures for an owner (newest first), JSON.
 *   POST → add a signature. Body: { name, message }. JSON or form-encoded.
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
  GUESTBOOK_MAX,
} from "@/lib/guestbook";

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
  return json({ ok: true, owner, total }, 201);
}
