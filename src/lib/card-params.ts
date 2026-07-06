/**
 * Card query-parameter parsing.
 *
 * The card endpoint (`GET /card/:user.svg`) accepts a handful of query params
 * to customize the render. Everything here is *best-effort and total*: an
 * invalid value never throws — it falls back to a sensible default — so a
 * malformed URL still yields a valid card rather than a broken <img>.
 *
 * Supported params:
 *   - `theme`        one of the built-in theme names (default: macos)
 *   - `accent`       hex color overriding the theme accent (with/without `#`)
 *   - `stats`        comma-separated stat keys to show, in order
 *   - `achievements` comma-separated achievement ids to whitelist
 *   - `animate`      boolean toggling the blinking cursor (default: true)
 *   - `ascii`        number 1..10 choosing the left ASCII art (default: 1)
 *   - `title`        custom string for the title bar path (default: devquest)
 */

import { z } from "zod";

import { DEFAULT_THEME, THEME_NAMES, type ThemeName } from "@/cards/themes";
import {
  ART_STYLES,
  DEFAULT_ART_STYLE,
  type ArtStyle,
} from "@/cards/styles/frame";
import { CARD_IDS, DEFAULT_CARD_ID } from "@/cards/registry";

/** Canonical stat keys the card knows how to render. */
export const STAT_KEYS = [
  "repos",
  "followers",
  "stars",
  "contributions",
  "streak",
  "prs",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

/** Default stat keys (and order) when `stats` isn't specified. */
export const DEFAULT_STAT_KEYS: StatKey[] = [
  "repos",
  "followers",
  "stars",
  "contributions",
  "streak",
];

/** Parsed, validated card options. All fields resolved to safe values. */
export interface CardParams {
  /** Which registered card template to render. */
  template: string;
  /** Art-style frame (window chrome) to render the template inside. */
  artStyle: ArtStyle;
  theme: ThemeName;
  /** Accent hex incl. leading `#`, or null to use the theme's own accent. */
  accent: string | null;
  /** Stat keys to render, in order. */
  stats: StatKey[];
  /** Whether the terminal cursor animates. */
  animate: boolean;
  /** Selected ASCII art index (1..10). */
  ascii: number;
  /** Custom titlebar string. */
  title: string;
}

/** A 3- or 6-digit hex color, with or without a leading `#`. */
const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Coerce common truthy/falsy string spellings to a boolean. */
function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw === null) return fallback;
  const v = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return fallback;
}

/** Normalize an accent param to `#rrggbb`/`#rgb`, or null if invalid/absent. */
function parseAccent(raw: string | null): string | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!HEX_RE.test(trimmed)) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

/** Parse a comma-separated list, trimming blanks and dropping empties. */
function parseList(raw: string | null): string[] {
  if (raw === null) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const themeSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.enum(THEME_NAMES))
  .catch(DEFAULT_THEME);

/**
 * Parse card params from a URLSearchParams (or any Map-like with `get`).
 * Total: always returns a fully-resolved {@link CardParams}.
 */
export function parseCardParams(search: URLSearchParams): CardParams {
  const theme = themeSchema.parse(search.get("theme") ?? DEFAULT_THEME);
  const accent = parseAccent(search.get("accent"));

  // Resolve template id against the registry; fall back to the default card.
  const rawTemplate = search.get("template")?.trim().toLowerCase() ?? "";
  const template = (CARD_IDS as readonly string[]).includes(rawTemplate)
    ? rawTemplate
    : DEFAULT_CARD_ID;

  // Resolve art style; fall back to the default frame.
  const rawArtStyle = search.get("style")?.trim().toLowerCase() ?? "";
  const artStyle = (ART_STYLES as readonly string[]).includes(rawArtStyle)
    ? (rawArtStyle as ArtStyle)
    : DEFAULT_ART_STYLE;

  // Keep only known stat keys, preserving requested order + de-duplicating.
  const requestedStats = parseList(search.get("stats")) as StatKey[];
  const seen = new Set<StatKey>();
  const stats: StatKey[] = [];
  for (const k of requestedStats) {
    if ((STAT_KEYS as readonly string[]).includes(k) && !seen.has(k)) {
      seen.add(k);
      stats.push(k);
    }
  }

  const rawTitle = search.get("title")?.trim() || "";
  // Sanitize: max 20 chars, fallback to devquest when empty.
  const title = rawTitle.slice(0, 20) || "devquest";

  // Parse ascii index (1..10), fallback to 1 on invalid.
  const rawAscii = parseInt(search.get("ascii") ?? "1", 10);
  const ascii = Number.isInteger(rawAscii) && rawAscii >= 1 && rawAscii <= 10 ? rawAscii : 1;

  return {
    template,
    artStyle,
    theme,
    accent,
    stats: stats.length > 0 ? stats : DEFAULT_STAT_KEYS,
    animate: parseBool(search.get("animate"), true),
    ascii,
    title,
  };
}
