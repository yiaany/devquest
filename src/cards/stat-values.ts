/**
 * Stat value + label resolution.
 *
 * Maps a canonical {@link StatKey} to its human label and a display-formatted
 * value from {@link GitHubStats}. Extracted so every template formats the same
 * stat identically.
 */

import { formatCount } from "@/cards/primitives";
import type { StatKey } from "@/lib/card-params";
import type { GitHubStats } from "@/lib/types";

/** Human labels for each canonical stat key. */
export const STAT_LABELS: Record<StatKey, string> = {
  repos: "Public repos",
  followers: "Followers",
  stars: "Total stars",
  contributions: "Contributions",
  streak: "Current streak",
  prs: "Merged PRs",
};

/** Display-formatted value for a stat key. */
export function statValue(key: StatKey, stats: GitHubStats): string {
  switch (key) {
    case "repos":
      return formatCount(stats.publicRepos);
    case "followers":
      return formatCount(stats.followers);
    case "stars":
      return formatCount(stats.totalStars);
    case "contributions":
      return formatCount(stats.contributionsLastYear);
    case "streak":
      return `${stats.currentStreak}d`;
    case "prs":
      return formatCount(stats.mergedPullRequests);
  }
}
