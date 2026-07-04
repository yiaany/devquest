import { describe, expect, it } from "vitest";

import { computeAchievements } from "@/lib/achievements/compute";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import { RARITY_ORDER } from "@/lib/achievements/types";
import type { GitHubStats } from "@/lib/types";

/**
 * Build a GitHubStats fixture. Defaults are deliberately "empty" (a brand-new
 * account) so a test only sets the fields relevant to the badge under test.
 */
function makeStats(overrides: Partial<GitHubStats> = {}): GitHubStats {
  return {
    username: "octocat",
    name: "The Octocat",
    avatarUrl: "https://example.com/a.png",
    bio: null,
    publicRepos: 0,
    followers: 0,
    following: 0,
    totalStars: 0,
    topLanguages: [],
    contributionsLastYear: 0,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: new Date().toISOString(),
    mergedPullRequests: 0,
    revivedDormantRepo: false,
    topRepos: [],
    ...overrides,
  };
}

/** ISO timestamp `years` in the past. */
function yearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString();
}

function ids(stats: GitHubStats): string[] {
  return computeAchievements(stats).map((a) => a.id);
}

describe("computeAchievements — empty profile", () => {
  it("unlocks nothing for a brand-new empty account", () => {
    expect(computeAchievements(makeStats())).toEqual([]);
  });
});

describe("computeAchievements — threshold boundaries", () => {
  it("unlocks Builder at exactly 10 repos, not at 9", () => {
    expect(ids(makeStats({ publicRepos: 9 }))).not.toContain("builder");
    expect(ids(makeStats({ publicRepos: 10 }))).toContain("builder");
  });

  it("unlocks Streak Keeper at 30-day longest streak", () => {
    expect(ids(makeStats({ longestStreak: 29 }))).not.toContain("streak-keeper");
    expect(ids(makeStats({ longestStreak: 30 }))).toContain("streak-keeper");
  });

  it("unlocks Unbroken at 100-day longest streak", () => {
    expect(ids(makeStats({ longestStreak: 100 }))).toContain("unbroken");
  });

  it("unlocks On a Roll at a 7-day current streak", () => {
    expect(ids(makeStats({ currentStreak: 7 }))).toContain("on-a-roll");
  });

  it("unlocks Prolific at 1000 contributions", () => {
    expect(ids(makeStats({ contributionsLastYear: 1000 }))).toContain(
      "prolific",
    );
  });

  it("unlocks Rising Star at 100 stars and Supernova at 1000", () => {
    expect(ids(makeStats({ totalStars: 100 }))).toContain("rising-star");
    expect(ids(makeStats({ totalStars: 100 }))).not.toContain("supernova");
    expect(ids(makeStats({ totalStars: 1000 }))).toContain("supernova");
  });

  it("unlocks Well Followed at 500 followers", () => {
    expect(ids(makeStats({ followers: 500 }))).toContain("well-followed");
  });

  it("unlocks Polyglot at 5 languages", () => {
    const langs = Array.from({ length: 5 }, (_, i) => ({
      name: `L${i}`,
      percent: 20,
      color: null,
    }));
    expect(ids(makeStats({ topLanguages: langs }))).toContain("polyglot");
  });

  it("unlocks Veteran for a 10+ year old account", () => {
    expect(ids(makeStats({ createdAt: yearsAgo(11) }))).toContain("veteran");
    expect(ids(makeStats({ createdAt: yearsAgo(2) }))).not.toContain("veteran");
  });

  it("unlocks Merge Master at 100 merged PRs, not at 99", () => {
    expect(ids(makeStats({ mergedPullRequests: 99 }))).not.toContain(
      "merge-master",
    );
    expect(ids(makeStats({ mergedPullRequests: 100 }))).toContain(
      "merge-master",
    );
  });

  it("unlocks Necromancer only when a dormant repo was revived", () => {
    expect(ids(makeStats({ revivedDormantRepo: false }))).not.toContain(
      "necromancer",
    );
    expect(ids(makeStats({ revivedDormantRepo: true }))).toContain(
      "necromancer",
    );
  });
});

describe("computeAchievements — honesty & ordering", () => {
  it("never unlocks achievements flagged requiresExtendedData", () => {
    // Max out every field, including the extended-data-backed ones. Badges
    // still flagged requiresExtendedData (e.g. night-owl, which has no honest
    // data source) must never appear.
    const maxed = makeStats({
      publicRepos: 10_000,
      followers: 1_000_000,
      totalStars: 1_000_000,
      contributionsLastYear: 100_000,
      currentStreak: 4000,
      longestStreak: 4000,
      createdAt: yearsAgo(20),
      mergedPullRequests: 100_000,
      revivedDormantRepo: true,
      topLanguages: Array.from({ length: 20 }, (_, i) => ({
        name: `L${i}`,
        percent: 5,
        color: null,
      })),
    });
    const unlocked = ids(maxed);
    const extended = ACHIEVEMENTS.filter((a) => a.requiresExtendedData).map(
      (a) => a.id,
    );
    for (const id of extended) expect(unlocked).not.toContain(id);
  });

  it("sorts unlocked achievements rarest-first", () => {
    const maxed = makeStats({
      publicRepos: 10_000,
      followers: 1_000_000,
      totalStars: 1_000_000,
      contributionsLastYear: 100_000,
      longestStreak: 4000,
      createdAt: yearsAgo(20),
    });
    const weights = computeAchievements(maxed).map(
      (a) => RARITY_ORDER[a.rarity],
    );
    const sortedDesc = [...weights].sort((a, b) => b - a);
    expect(weights).toEqual(sortedDesc);
  });

  it("has unique achievement ids", () => {
    const seen = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(seen.size).toBe(ACHIEVEMENTS.length);
  });
});
