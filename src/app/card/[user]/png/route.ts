/**
 * PNG card endpoint: GET /card/:user/png (or /card/:user.png in devquest.dev)
 *
 * Fetches the card's SVG and converts it to a high-quality raster PNG via
 * @resvg/resvg-js. Useful for slides, resume builders, or social media previews
 * where SVG embedding isn't supported.
 */

import { Resvg } from "@resvg/resvg-js";
import { getCachedStats, setCachedStats } from "@/lib/cache";
import { parseCardParams } from "@/lib/card-params";
import {
  getGitHubStats,
  GitHubUserNotFoundError,
  GitHubRateLimitError,
} from "@/lib/github";
import { renderCard, renderErrorCard, CARD_WIDTH } from "@/lib/render";

export const runtime = "nodejs";

const CACHE_CONTROL_OK =
  "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400";
const CACHE_CONTROL_ERR = "public, max-age=0, s-maxage=60";

function pngResponse(pngBuffer: Buffer, cacheControl: string): Response {
  return new Response(new Uint8Array(pngBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": cacheControl,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: { user: string } },
) {
  const username = params.user.replace(/\.svg$/i, "").trim() || "anonymous";
  const cardParams = parseCardParams(new URL(request.url).searchParams);

  try {
    // 1) Cache check.
    let stats = await getCachedStats(username);

    // 2) Fetch on miss.
    if (!stats) {
      stats = await getGitHubStats(username);
      await setCachedStats(username, stats);
    }

    // 3) Render SVG -> Convert to PNG.
    const svg = await renderCard(stats, cardParams);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: CARD_WIDTH },
    });
    const pngData = resvg.render().asPng();

    return pngResponse(pngData, CACHE_CONTROL_OK);
  } catch (error) {
    const message =
      error instanceof GitHubUserNotFoundError
        ? "user not found"
        : error instanceof GitHubRateLimitError
          ? "rate limited — try later"
          : "could not load stats";

    try {
      const errSvg = await renderErrorCard(username, message, cardParams);
      const resvg = new Resvg(errSvg, {
        fitTo: { mode: "width", value: CARD_WIDTH },
      });
      const pngData = resvg.render().asPng();
      return pngResponse(pngData, CACHE_CONTROL_ERR);
    } catch (renderError) {
      console.error("[card/png] fallback failed:", renderError);
      return new Response("Failed to generate PNG", { status: 500 });
    }
  }
}
