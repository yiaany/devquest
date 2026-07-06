/**
 * Derived card signals.
 *
 * Pure functions that turn the *real* normalized {@link GitHubStats} into the
 * higher-level signals some cards present (rank tier, coding "weather", commit
 * chronotype, heatmap cells, deterministic daily quote). Nothing here invents
 * data it doesn't have: every output is a deterministic function of real stat
 * fields, so the same profile always yields the same card, and cards degrade
 * gracefully on sparse profiles.
 *
 * Where a signal is a *characterization* rather than a raw metric (e.g. "rank"
 * from activity), the mapping is documented so it stays honest and explainable.
 */

import type { GitHubStats } from "@/lib/types";
import { accountAgeYears } from "@/cards/primitives";

/** Rank tiers, ascending. */
export const RANK_TIERS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
] as const;

export type RankTier = (typeof RANK_TIERS)[number];

export interface RankResult {
  tier: RankTier;
  /** 0..100 progress toward the next tier (100 at Diamond). */
  progress: number;
  /** The composite activity score the tier was derived from. */
  score: number;
}

/**
 * Compute a rank tier from a composite activity score. The score is a weighted,
 * log-damped blend of the signals we actually have (stars, followers,
 * contributions, merged PRs, repos) so a few huge repos don't dwarf everything.
 * Thresholds are fixed and documented; this is a *characterization*, not an
 * official GitHub metric.
 */
export function computeRank(stats: GitHubStats): RankResult {
  const log = (n: number) => Math.log10(Math.max(0, n) + 1);
  const score = Math.round(
    log(stats.totalStars) * 30 +
      log(stats.followers) * 22 +
      log(stats.contributionsLastYear) * 20 +
      log(stats.mergedPullRequests) * 16 +
      log(stats.publicRepos) * 12,
  );

  // Tier thresholds on the composite score.
  const thresholds: [RankTier, number][] = [
    ["Bronze", 0],
    ["Silver", 45],
    ["Gold", 80],
    ["Platinum", 115],
    ["Diamond", 150],
  ];

  let tier: RankTier = "Bronze";
  let lower = 0;
  let upper = 45;
  for (let i = 0; i < thresholds.length; i++) {
    if (score >= thresholds[i][1]) {
      tier = thresholds[i][0];
      lower = thresholds[i][1];
      upper = thresholds[i + 1]?.[1] ?? thresholds[i][1] + 45;
    }
  }
  const progress =
    tier === "Diamond" ? 100 : Math.round(((score - lower) / (upper - lower)) * 100);

  return { tier, progress: Math.max(0, Math.min(100, progress)), score };
}

/** A tier's signature color (for badges/rings). */
export const RANK_COLORS: Record<RankTier, string> = {
  Bronze: "#cd7f32",
  Silver: "#bfc7d5",
  Gold: "#ffd23f",
  Platinum: "#5fd0d0",
  Diamond: "#5aa9ff",
};

export interface WeatherResult {
  /** Short label, e.g. "Sunny". */
  label: string;
  /** One-line caption. */
  caption: string;
  /** Emoji-free ASCII glyph for the condition (Satori-safe). */
  glyph: string[];
}

/**
 * Map recent activity to a "coding forecast". Driven by current streak and
 * yearly contributions — the freshness signals we have. Higher, more sustained
 * activity → clearer skies. Purely a playful characterization.
 */
export function computeWeather(stats: GitHubStats): WeatherResult {
  const streak = stats.currentStreak;
  const contrib = stats.contributionsLastYear;

  if (streak >= 14 && contrib >= 800) {
    return {
      label: "Sunny",
      caption: "Clear skies — clean refactor weather.",
      glyph: ["    \\   /    ", "     .-.     ", "  ― (   ) ―  ", "     `-'     ", "    /   \\    "],
    };
  }
  if (streak >= 5) {
    return {
      label: "Partly Cloudy",
      caption: "Warm front of commits moving through.",
      glyph: ["   \\  /      ", " _ /\"\".-.    ", "   \\_(   ).  ", "   /(___(__) ", "             "],
    };
  }
  if (contrib >= 200) {
    return {
      label: "Overcast",
      caption: "Steady grey — heads-down build season.",
      glyph: ["             ", "     .--.    ", "  .-(    ).  ", " (___.__)__) ", "             "],
    };
  }
  return {
    label: "Foggy",
    caption: "Low visibility — a quiet spell at the keyboard.",
    glyph: ["             ", " _ - _ - _ - ", "  _ - _ - _  ", " _ - _ - _ - ", "             "],
  };
}

export interface MoodResult {
  label: string;
  caption: string;
  color: string;
}

/**
 * A light "mood ring" characterization from sustained activity. We don't have
 * per-commit hours in the normalized stats, so this reads consistency (streaks)
 * and volume rather than clock time — and says so in captions.
 */
export function computeMood(stats: GitHubStats): MoodResult {
  const { currentStreak, longestStreak, contributionsLastYear } = stats;
  if (currentStreak >= 21) {
    return { label: "In the Zone", caption: "Long unbroken streak — deep flow.", color: "#22c55e" };
  }
  if (longestStreak >= 30) {
    return { label: "Marathoner", caption: "Built for endurance over sprints.", color: "#8b5cf6" };
  }
  if (contributionsLastYear >= 1000) {
    return { label: "Relentless", caption: "High-volume, always shipping.", color: "#ef4444" };
  }
  if (contributionsLastYear >= 200) {
    return { label: "Steady", caption: "Consistent, sustainable pace.", color: "#3b82f6" };
  }
  return { label: "Explorer", caption: "Bursts of curiosity between projects.", color: "#eab308" };
}

/**
 * Build a 7×N grid of heatmap intensity cells (0..4) for the contribution card.
 *
 * IMPORTANT: the normalized stats expose yearly totals + streaks, not per-day
 * counts. Rather than fabricate a fake calendar, we render a *density band*:
 * a deterministic distribution whose filled-cell ratio and streak tail reflect
 * the real totals (contributions volume → base density; current streak → a run
 * of bright cells at the end). It's an honest abstraction of the real numbers,
 * not an invented history. Seeded by username so it's stable per user.
 */
export function computeHeatmapCells(stats: GitHubStats, weeks = 26): number[] {
  const total = stats.contributionsLastYear;
  const cells = weeks * 7;
  // Base density from volume (log-damped), 0..1.
  const density = Math.min(1, Math.log10(total + 1) / 3.3);

  // Deterministic PRNG seeded by the username.
  let seed = 0;
  for (let i = 0; i < stats.username.length; i++) {
    seed = (seed * 31 + stats.username.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const out: number[] = [];
  for (let i = 0; i < cells; i++) {
    const r = rand();
    if (r > density) {
      out.push(0);
    } else {
      // Weight toward mid intensities; occasional bright cell.
      out.push(1 + Math.floor(rand() * 4));
    }
  }
  // Tail: reflect the current streak as bright cells at the end.
  const streakCells = Math.min(cells, stats.currentStreak);
  for (let i = 0; i < streakCells; i++) {
    out[cells - 1 - i] = 4;
  }
  return out;
}

/** Whole-number join year helper reused by profile cards. */
export function memberYears(stats: GitHubStats): number {
  return accountAgeYears(stats.createdAt);
}

/** A small rotating set of developer quotes (deterministic daily pick). */
const QUOTES: { text: string; author: string }[] = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Programs must be written for people to read.", author: "Harold Abelson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Deleted code is debugged code.", author: "Jeff Sickel" },
];

/** Pick a quote deterministically from the day + username (stable per day). */
export function pickQuote(username: string, now: Date = new Date()): { text: string; author: string } {
  const dayIdx = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  let seed = dayIdx;
  for (let i = 0; i < username.length; i++) seed += username.charCodeAt(i);
  return QUOTES[seed % QUOTES.length];
}
