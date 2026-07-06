/**
 * Card render context.
 *
 * The single, resolved input every card template receives. It bundles the
 * normalized GitHub data with the fully-resolved presentation options (theme,
 * accent, art style, animate) plus the raw {@link CardParams} for cards that
 * need template-specific options (e.g. which stats, custom title, ascii index).
 *
 * Templates are pure: `(ctx) => JSX`. They never fetch, never read the
 * environment, and never throw — a sparse profile still yields a valid card.
 */

import type { ArtStyle } from "@/cards/styles/frame";
import type { CardTheme } from "@/cards/themes";
import type { CardParams } from "@/lib/card-params";
import type { GitHubStats } from "@/lib/types";

export interface CardContext {
  /** Normalized GitHub stats for the requested handle. */
  stats: GitHubStats;
  /** Resolved theme palette. */
  theme: CardTheme;
  /** Resolved accent color (`#rrggbb`), already includes theme fallback. */
  accent: string;
  /** Resolved art style (the window chrome). */
  artStyle: ArtStyle;
  /** Whether decorative animation (cursor blink) is on. */
  animate: boolean;
  /** Resolved title-bar / header text. */
  title: string;
  /** Full parsed params for template-specific options. */
  params: CardParams;
}
