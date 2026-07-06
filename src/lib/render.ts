/**
 * Card render engine.
 *
 * Wraps Satori to turn a card template (JSX) into an SVG string. Fonts are
 * read from disk once and memoized for the lifetime of the server process.
 *
 * This module is server-only: it uses `node:fs`/`node:path` and must never be
 * imported into a client component.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import satori, { type SatoriOptions } from "satori";

import { TerminalCard, type TerminalCardProps } from "@/cards/TerminalCard";
import { CURSOR_SENTINEL } from "@/cards/TerminalCard";
import {
  CARD_WIDTH as CANVAS_WIDTH,
  CARD_HEIGHT as CANVAS_HEIGHT,
  formatCount,
} from "@/cards/primitives";
import { resolveTheme, type CardTheme } from "@/cards/themes";
import { resolveArtStyle } from "@/cards/styles/frame";
import { resolveCard } from "@/cards/registry";
import type { CardContext } from "@/cards/context";


import {
  DEFAULT_STAT_KEYS,
  type CardParams,
  type StatKey,
} from "@/lib/card-params";
import type { GitHubStats } from "@/lib/types";

/** Card canvas dimensions (px). Re-exported from primitives for callers/tests. */
export const CARD_WIDTH = CANVAS_WIDTH;
export const CARD_HEIGHT = CANVAS_HEIGHT;

type FontWeight = SatoriOptions["fonts"][number]["weight"];

/**
 * Font files to load, relative to the project root (`public/fonts`).
 * JetBrains Mono is licensed under the SIL Open Font License 1.1.
 */
const FONT_FILES: { file: string; weight: FontWeight }[] = [
  { file: "JetBrainsMono-Regular.ttf", weight: 400 },
  { file: "JetBrainsMono-Bold.ttf", weight: 700 },
];

/** Memoized font data so we only hit the filesystem once. */
let fontCache: SatoriOptions["fonts"] | null = null;

/** Load and cache the JetBrains Mono font faces as ArrayBuffers. */
async function loadFonts(): Promise<SatoriOptions["fonts"]> {
  if (fontCache) return fontCache;

  const fontDir = path.join(process.cwd(), "public", "fonts");
  const fonts = await Promise.all(
    FONT_FILES.map(async ({ file, weight }) => {
      const data = await readFile(path.join(fontDir, file));
      return {
        name: "JetBrains Mono",
        data,
        weight,
        style: "normal" as const,
      };
    }),
  );

  fontCache = fonts;
  return fonts;
}

/**
 * Props accepted by the low-level {@link renderElementToSvg}. A discriminated
 * union over the three templates isn't needed here — each builder returns a
 * concrete element, and the post-processing only depends on theme/accent/
 * animate, which all card prop shapes carry (or default).
 */
export type RenderCardProps = TerminalCardProps;

/** Human label + resolved value + internal key for each canonical stat key. */
function statRow(
  key: StatKey,
  stats: GitHubStats,
): { label: string; value: string; key: string } {
  switch (key) {
    case "repos":
      return { label: "Public repos", value: formatCount(stats.publicRepos), key };
    case "followers":
      return { label: "Followers", value: formatCount(stats.followers), key };
    case "stars":
      return { label: "Total stars", value: formatCount(stats.totalStars), key };
    case "contributions":
      return {
        label: "Contributions",
        value: formatCount(stats.contributionsLastYear),
        key,
      };
    case "streak":
      return { label: "Current streak", value: `${stats.currentStreak}d`, key };
    case "prs":
      return {
        label: "Merged PRs",
        value: formatCount(stats.mergedPullRequests),
        key,
      };
  }
}

/**
 * Build {@link TerminalCardProps} from normalized GitHub stats and (optional)
 * card params. Params control the theme, accent, which stats appear, which
 * achievements are shown, and whether the cursor animates. Omitting `params`
 * yields the defaults (macOS theme, default stat set, all achievements).
 */
export function statsToCardProps(
  stats: GitHubStats,
  params?: CardParams,
): RenderCardProps {
  const theme = resolveTheme(params?.theme);
  const accent = params?.accent ?? theme.accent;
  const statKeys = params?.stats ?? DEFAULT_STAT_KEYS;

  return {
    username: stats.username,
    theme,
    accent,
    animate: params?.animate ?? true,
    ascii: params?.ascii ?? 1,
    title: params?.title ?? "devquest",
    stats: statKeys.map((k) => statRow(k, stats)),
  };
}

/**
 * Post-process Satori's SVG:
 *   1. Swap the cursor sentinel fill for the real accent color.
 *   2. When animated, attach an <animate> to blink the cursor's opacity.
 *   3. Overlay a subtle scanline pattern at the theme's configured opacity.
 *
 * We operate on the raw SVG string because Satori emits static SVG (no SMIL)
 * and gives us no post-layout hook. The sentinel is a fixed, unique color the
 * template paints the cursor with, so a targeted match is safe.
 */
function postProcessSvg(
  svg: string,
  opts: { accent: string; animate: boolean; theme: CardTheme },
): string {
  let out = svg;

  // 1/2) Cursor. Match the *entire* self-closing element carrying the sentinel
  // fill — `<rect .../>` or `<path .../>` depending on Satori's output — so we
  // don't care about attribute order. Recolor it, and when animating, convert
  // it to a container element wrapping an <animate> opacity blink.
  const cursorRe = new RegExp(
    `<(rect|path)([^>]*?)fill="${CURSOR_SENTINEL}"([^>]*?)/>`,
    "gi",
  );
  out = out.replace(cursorRe, (_m, tag: string, pre: string, post: string) => {
    const opened = `<${tag}${pre}fill="${opts.accent}"${post}`;
    if (!opts.animate) return `${opened}/>`;
    return (
      `${opened}>` +
      `<animate attributeName="opacity" values="1;1;0;0" ` +
      `keyTimes="0;0.5;0.5;1" dur="1.06s" repeatCount="indefinite"/>` +
      `</${tag}>`
    );
  });

  // 3) Scanline overlay: 1px lines every 3px at a low, theme-defined opacity.
  if (opts.theme.scanlineOpacity > 0) {
    const defs =
      `<defs><pattern id="dq-scan" width="1" height="3" ` +
      `patternUnits="userSpaceOnUse">` +
      `<rect width="1" height="1" fill="#000000"/></pattern></defs>`;
    const overlay =
      `<rect x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" ` +
      `fill="url(#dq-scan)" opacity="${opts.theme.scanlineOpacity}"/>`;
    // defs right after the opening <svg …>; overlay just before </svg>.
    out = out.replace(/(<svg[^>]*>)/, `$1${defs}`);
    out = out.replace(/<\/svg>\s*$/, `${overlay}</svg>`);
  }

  return out;
}

/**
 * Render an arbitrary card element (JSX) to an SVG string, applying the shared
 * Satori pipeline + post-processing (cursor recolor/blink, scanlines).
 */
async function renderElementToSvg(
  element: React.ReactNode,
  opts: { accent: string; animate: boolean; theme: CardTheme },
): Promise<string> {
  const fonts = await loadFonts();

  const svg = await satori(element as React.ReactElement, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts,
  });

  return postProcessSvg(svg, opts);
}

/**
 * Render a terminal card template to an SVG string.
 *
 * @param props - Card data (username, theme, accent, stats, animate, or an
 *                errorMessage).
 * @returns SVG markup as a UTF-8 string.
 */
export async function renderCardToSvg(props: RenderCardProps): Promise<string> {
  const theme = props.theme ?? resolveTheme(undefined);
  const accent = props.accent ?? theme.accent;
  const animate = props.animate ?? true;

  return renderElementToSvg(TerminalCard(props), { accent, animate, theme });
}

/**
 * Top-level entry: render any registered card from normalized GitHub stats.
 *
 * Resolves the requested template + art style from {@link CardParams}, builds
 * the {@link CardContext} every template consumes, and dispatches to the
 * registry's `render(ctx)`. Falls back to the default card for an unknown id
 * (resolveCard never throws), preserving backward compatibility with the
 * original single-card endpoint.
 */
export async function renderCard(
  stats: GitHubStats,
  params: CardParams,
): Promise<string> {
  const entry = resolveCard(params.template);
  const theme = resolveTheme(params.theme);
  const accent = params.accent ?? theme.accent;
  const animate = params.animate ?? true;

  // Resolve the art style, honoring the card's supported set: if the requested
  // style isn't supported by this card, use the card's default.
  const requested = resolveArtStyle(params.artStyle);
  const artStyle = entry.artStyles.includes(requested)
    ? requested
    : entry.defaultArtStyle;

  const ctx: CardContext = {
    stats,
    theme,
    accent,
    artStyle,
    animate,
    title: params.title ?? "devquest",
    params,
  };

  return renderElementToSvg(entry.render(ctx), { accent, animate, theme });
}

/**
 * Render a friendly error card when stats could not be loaded.
 */
export async function renderErrorCard(
  username: string,
  message: string,
  params: CardParams,
): Promise<string> {
  const theme = resolveTheme(params.theme);
  const accent = params.accent ?? theme.accent;

  return renderCardToSvg({
    username,
    errorMessage: message,
    theme,
    accent,
    animate: params.animate,
  });
}


