"use client";

/**
 * Guestbook sign page: /:user/sign
 *
 * The interactive counterpart to the Guestbook card. Visitors leave a signed
 * message on an owner's wall; the list refreshes live. Talks to the public
 * `/api/guestbook/:owner` endpoint (GET to list, POST to sign).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { GridPattern } from "@/components/ui/grid-pattern";

interface Entry {
  name: string;
  message: string;
  at: number;
}

const NAME_MAX = 32;
const MESSAGE_MAX = 100;

export default function SignPage({ params }: { params: { user: string } }) {
  const owner = params.user;

  const { data: session } = useSession();
  const sessionUser = session?.user as unknown as { username?: string; name?: string } | undefined;
  const myHandle = sessionUser?.username ?? sessionUser?.name ?? null;
  const isOwner = !!myHandle && myHandle.toLowerCase() === owner.toLowerCase();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [removingAt, setRemovingAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/guestbook/${encodeURIComponent(owner)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("failed to load");
      const data = (await res.json()) as { entries: Entry[]; total: number };
      setEntries(data.entries ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Could not load the guestbook.");
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/guestbook/${encodeURIComponent(owner)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not sign.");
      }
      const data = (await res.json().catch(() => ({}))) as { durable?: boolean };
      // Honesty: if the backend isn't durable, the signature won't persist.
      if (data.durable === false) {
        setWarning(
          "Heads up: this deployment has no persistent storage configured, so signatures may not stick. The owner needs to connect Upstash/Vercel KV.",
        );
      }
      setName("");
      setMessage("");
      setDone(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign.");
    } finally {
      setSubmitting(false);
    }
  }

  /** Owner-only: delete a single signature by timestamp. */
  async function remove(at: number) {
    if (!isOwner || removingAt !== null) return;
    setRemovingAt(at);
    setError(null);
    try {
      const res = await fetch(
        `/api/guestbook/${encodeURIComponent(owner)}?at=${at}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not delete.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setRemovingAt(null);
    }
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 text-neutral-100">
      <GridPattern
        width={40}
        height={40}
        className="pointer-events-none absolute inset-0 h-full w-full fill-neutral-800/20 stroke-neutral-800/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
      />
      <div className="relative mx-auto flex max-w-2xl flex-col px-6 py-16">
        <Link
          href="/"
          className="mb-8 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← DevQuest
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">
          Sign{" "}
          <span className="text-emerald-400">{owner}</span>&rsquo;s guestbook
        </h1>
        <p className="mt-2 text-neutral-400">
          Leave a message on their wall. It appears on their DevQuest guestbook
          card. {total > 0 ? `${total} ${total === 1 ? "person has" : "people have"} signed.` : "Be the first to sign."}
        </p>

        {/* Sign form */}
        <form
          onSubmit={submit}
          className="mt-8 flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-neutral-300">
              Your name or handle
            </label>
            <input
              id="name"
              type="text"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder="octocat"
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition-colors focus:border-emerald-500"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium text-neutral-300">
              Message{" "}
              <span className="text-neutral-500">
                ({message.length}/{MESSAGE_MAX})
              </span>
            </label>
            <textarea
              id="message"
              value={message}
              maxLength={MESSAGE_MAX}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Love your work! 🚀"
              rows={2}
              className="resize-none rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition-colors focus:border-emerald-500"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {warning ? <p className="text-sm text-amber-400">{warning}</p> : null}
          {done ? (
            <p className="text-sm text-emerald-400">Thanks for signing! 🎉</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing…" : "Sign the guestbook"}
          </button>
        </form>

        {/* Wall */}
        <h2 className="mb-4 mt-12 text-lg font-semibold text-neutral-200">
          Recent signatures
        </h2>

        {/* Owner moderation banner */}
        {isOwner ? (
          <p className="mb-4 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-300">
            You&rsquo;re signed in as the owner — you can delete any signature below.
          </p>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="mb-4 self-start text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-neutral-300 hover:underline"
          >
            Are you {owner}? Sign in to moderate.
          </button>
        )}

        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-neutral-500">No signatures yet — yours could be the first.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((sig, i) => (
              <li
                key={`${sig.name}-${sig.at}-${i}`}
                className="group rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-emerald-400">{sig.name}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <time className="text-xs text-neutral-600">
                      {new Date(sig.at).toLocaleDateString()}
                    </time>
                    {isOwner ? (
                      <button
                        onClick={() => remove(sig.at)}
                        disabled={removingAt === sig.at}
                        aria-label="Delete this signature"
                        className="text-xs text-neutral-600 transition-colors hover:text-red-400 disabled:opacity-50"
                      >
                        {removingAt === sig.at ? "removing…" : "delete"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {sig.message ? (
                  <p className="mt-1 text-neutral-300">{sig.message}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}