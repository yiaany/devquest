/**
 * Achievement definitions.
 *
 * Each entry's `unlock` reads only fields present on {@link GitHubStats}, so
 * every badge is backed by real public data. Achievements that need data
 * DevQuest doesn't fetch yet are marked `requiresExtendedData` and return
 * `false` — see {@link Achievement.requiresExtendedData}.
 *
 * Thresholds are intentionally conservative so a badge means something.
 */

import type { Achievement } from "@/lib/achievements/types";

/** Years between an ISO timestamp and now, as a fractional number. */
function accountAgeYears(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  const ms = Date.now() - created;
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}

/**
 * The registry. Order here is not significant — unlocked achievements are
 * sorted by rarity at compute time (see `compute.ts`).
 */
export const ACHIEVEMENTS: Achievement[] = [
  // --- Streak / consistency --------------------------------------------------
  {
    id: "streak-keeper",
    name: "Streak Keeper",
    emoji: "🔥",
    rarity: "rare",
    description: "Maintained a 30+ day contribution streak.",
    unlock: (s) => s.longestStreak >= 30,
  },
  {
    id: "unbroken",
    name: "Unbroken",
    emoji: "⛓️",
    rarity: "legendary",
    description: "A 100+ day contribution streak. Relentless.",
    unlock: (s) => s.longestStreak >= 100,
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    emoji: "📈",
    rarity: "common",
    description: "Currently on a 7+ day contribution streak.",
    unlock: (s) => s.currentStreak >= 7,
  },
  {
    id: "prolific",
    name: "Prolific",
    emoji: "🏗️",
    rarity: "epic",
    description: "1,000+ contributions in the last year.",
    unlock: (s) => s.contributionsLastYear >= 1000,
  },

  // --- Reach / popularity ----------------------------------------------------
  {
    id: "rising-star",
    name: "Rising Star",
    emoji: "⭐",
    rarity: "rare",
    description: "Earned 100+ total stars across public repos.",
    unlock: (s) => s.totalStars >= 100,
  },
  {
    id: "supernova",
    name: "Supernova",
    emoji: "🌟",
    rarity: "legendary",
    description: "Earned 1,000+ total stars. A gravitational pull.",
    unlock: (s) => s.totalStars >= 1000,
  },
  {
    id: "well-followed",
    name: "Well Followed",
    emoji: "👥",
    rarity: "epic",
    description: "500+ followers watching your work.",
    unlock: (s) => s.followers >= 500,
  },

  // --- Output / breadth ------------------------------------------------------
  {
    id: "builder",
    name: "Builder",
    emoji: "🔨",
    rarity: "common",
    description: "Published 10+ public repositories.",
    unlock: (s) => s.publicRepos >= 10,
  },
  {
    id: "polyglot",
    name: "Polyglot",
    emoji: "🗣️",
    rarity: "rare",
    description: "Ships in 5+ languages.",
    unlock: (s) => s.topLanguages.length >= 5,
  },

  // --- Tenure ----------------------------------------------------------------
  {
    id: "veteran",
    name: "Veteran",
    emoji: "🎖️",
    rarity: "rare",
    description: "GitHub account 10+ years old.",
    unlock: (s) => accountAgeYears(s.createdAt) >= 10,
  },

  // --- Extended-data achievements --------------------------------------------
  // These depend on data fetched only via the token-gated GraphQL path
  // (github.ts). Without a GITHUB_TOKEN the underlying fields are 0/false, so
  // they simply don't unlock — never a fake unlock.
  {
    id: "merge-master",
    name: "Merge Master",
    emoji: "🔀",
    rarity: "epic",
    description: "100+ merged pull requests.",
    unlock: (s) => s.mergedPullRequests >= 100,
  },
  {
    id: "necromancer",
    name: "Necromancer",
    emoji: "🧟",
    rarity: "legendary",
    description: "Revived a repo dormant for 1+ year with new commits.",
    unlock: (s) => s.revivedDormantRepo,
  },

  // Still gated: Night Owl needs the *local* hour each commit was authored.
  // GitHub's API exposes commit timestamps in UTC only (no author timezone
  // offset we can trust), so a "midnight–5am" classification would be wrong for
  // anyone not near UTC. Left unconditionally locked until we have a reliable
  // per-commit local-time source rather than shipping a dishonest badge.
  {
    id: "night-owl",
    name: "Night Owl",
    emoji: "🦉",
    rarity: "epic",
    description: "A large share of commits pushed between midnight and 5am.",
    unlock: () => false,
    requiresExtendedData: true,
  },
];
