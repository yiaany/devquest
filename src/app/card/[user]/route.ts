/**
 * SVG card endpoint: GET /card/:user.svg
 *
 * Renders a terminal-style profile card for the given handle and returns it as
 * `image/svg+xml`, so it can be embedded directly via <img> in Markdown/HTML
 * (e.g. GitHub READMEs).
 *
 * Data flow:
 *   1. Look up cached stats for the handle (KV in prod, in-memory locally).
 *   2. On miss, fetch from the GitHub API and populate the cache.
 *   3. Render the card from the stats.
 *
 * Any failure (unknown user, rate limit, upstream error) renders a friendly
 * fallback card with HTTP 200 rather than a blank body or a 500 — the card is
 * embedded as an <img>, so a non-200 would just show a broken image.
 *
 * The `:user` segment carries a trailing `.svg` (e.g. `octocat.svg`) so the URL
 * reads like a static asset; we strip it before use.
 */

import { getCachedStats, setCachedStats } from "@/lib/cache";
import { parseCardParams } from "@/lib/card-params";
import {
  getGitHubStats,
  GitHubUserNotFoundError,
  GitHubRateLimitError,
} from "@/lib/github";
import { renderCard, renderErrorCard } from "@/lib/render";
import { resolveCard } from "@/cards/registry";

/** Force Node.js runtime — Satori font loading uses `node:fs`. */
export const runtime = "nodejs";

/**
 * Cache headers for a successful card. The browser/GitHub camo proxy may cache
 * for a few minutes; shared caches (CDN) hold longer and revalidate in the
 * background. Aligns loosely with the 6h data TTL.
 */
const CACHE_CONTROL_OK =
  "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400";
/**
 * Interactive cards (guestbook, poll) render live, user-generated data, so a
 * 6h CDN cache would leave fresh signatures/votes invisible for hours. Keep
 * them short-lived and always revalidating so a new signature shows up within
 * ~a minute. (GitHub's camo proxy may still add its own caching layer.)
 */
const CACHE_CONTROL_INTERACTIVE =
  "public, max-age=0, s-maxage=30, stale-while-revalidate=60";
/** Error cards shouldn't be cached for long — the user may fix the handle. */
const CACHE_CONTROL_ERR = "public, max-age=0, s-maxage=60";

/** SVG response helper. */
function svgResponse(svg: string, cacheControl: string): Response {
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: { user: string } },
) {
  // Allow both `/card/octocat` and `/card/octocat.svg`.
  const username = params.user.replace(/\.svg$/i, "").trim() || "anonymous";

  // Parse customization params (theme/accent/stats/achievements/animate).
  // Total & fail-safe: invalid values fall back to defaults, never throw.
  const cardParams = parseCardParams(new URL(request.url).searchParams);

  try {
    // 1) Cache first.
    let stats = await getCachedStats(username);

    // 2) Miss → fetch + populate.
    if (!stats) {
      stats = await getGitHubStats(username);
      await setCachedStats(username, stats);
    }

    // 3) Render from real data, in the requested mode.
    const svg = await renderCard(stats, cardParams);
    // Interactive cards (live user data) must not sit in a 6h CDN cache.
    const cacheControl = resolveCard(cardParams.template).interactive
      ? CACHE_CONTROL_INTERACTIVE
      : CACHE_CONTROL_OK;
    return svgResponse(svg, cacheControl);
  } catch (error) {
    // Friendly fallback card (still HTTP 200 so the <img> renders something).
    const message =
      error instanceof GitHubUserNotFoundError
        ? "user not found"
        : error instanceof GitHubRateLimitError
          ? "rate limited — try later"
          : "could not load stats";

    if (!(error instanceof GitHubUserNotFoundError)) {
      console.error(`[card] falling back for "${username}":`, error);
    }

    try {
      // Honor mode/theme/accent/animate on the error card too, for visual
      // consistency with what the user embedded.
      const svg = await renderErrorCard(username, message, cardParams);
      return svgResponse(svg, CACHE_CONTROL_ERR);
    } catch (renderError) {
      // Rendering itself failed — nothing left to show.
      console.error(`[card] fallback render failed for "${username}":`, renderError);
      return new Response("Failed to render card", { status: 500 });
    }
  }
}

