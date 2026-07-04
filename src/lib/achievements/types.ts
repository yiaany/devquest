/**
 * Achievement engine — shared types.
 *
 * Achievements are pure, data-driven badges: each one declares an `unlock`
 * predicate over the normalized {@link GitHubStats}. There is no hidden state —
 * given the same stats, the same achievements always unlock. This keeps the
 * engine trivially testable and honest (a badge only appears if the underlying
 * public data actually earns it).
 */

import type { GitHubStats } from "@/lib/types";

/**
 * Rarity tiers, ordered from most common to rarest. The order here defines the
 * canonical sort/weight via {@link RARITY_ORDER} — do not reorder casually.
 */
export type Rarity = "common" | "rare" | "epic" | "legendary";

/**
 * Sort weight per rarity (higher = rarer). Used to order unlocked achievements
 * so the flashiest ones surface first, and to drive rarity-based styling.
 */
export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

/** A single achievement definition. */
export interface Achievement {
  /** Stable, unique identifier (kebab-case). Used as a React key / analytics. */
  id: string;
  /** Human-facing name, e.g. "Streak Keeper". */
  name: string;
  /** A single emoji used as the badge icon. */
  emoji: string;
  /** Rarity tier, drives ordering and highlight styling. */
  rarity: Rarity;
  /** Short, user-facing description of what earns the badge. */
  description: string;
  /**
   * Predicate deciding whether the badge is unlocked for the given stats.
   * Must be pure and side-effect free.
   */
  unlock: (stats: GitHubStats) => boolean;
  /**
   * When true, this achievement depends on data DevQuest does not fetch yet
   * (e.g. per-commit timestamps, merged-PR counts, per-repo commit history).
   * Its {@link unlock} returns `false` unconditionally so it can never produce
   * a fake unlock — it's registered for discoverability and implemented once
   * the extended data is wired into `github.ts`.
   */
  requiresExtendedData?: boolean;
}
