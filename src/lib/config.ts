/**
 * DevQuest — global project configuration & brand constants.
 * Single source of truth for naming, URLs, and defaults.
 */

export const SITE = {
  /** Brand / product name. */
  name: "DevQuest",
  /** Short tagline used across landing and meta tags. */
  tagline: "Turn your GitHub profile into a card worth showing off.",
  /** Longer description for SEO / social meta. */
  description:
    "DevQuest turns your GitHub profile into a live, personality-driven card — terminal, formal, or fun — generated on the fly from your real stats.",
  /**
   * Public base URL. Configured via NEXT_PUBLIC_BASE_URL in production,
   * falls back to localhost during development.
   */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  /** Watermark shown on free cards (part of the growth loop). */
  watermark: "made with devquest.dev",
} as const;

/** Card render modes. `terminal` is the default. */
export const CARD_MODES = ["terminal", "formal", "fun"] as const;
export type CardMode = (typeof CARD_MODES)[number];
export const DEFAULT_MODE: CardMode = "terminal";

/** Available color themes for cards. `macos` is the default. */
export const CARD_THEMES = ["macos", "matrix", "cyberpunk", "paper"] as const;
export type CardTheme = (typeof CARD_THEMES)[number];
export const DEFAULT_THEME: CardTheme = "macos";

/** Default accent color (hex, without leading #). */
export const DEFAULT_ACCENT = "00ff9c";

/** Cache TTL for fetched GitHub stats, in seconds (6 hours). */
export const STATS_CACHE_TTL = 60 * 60 * 6;
