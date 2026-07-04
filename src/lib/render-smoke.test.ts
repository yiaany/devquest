import { describe, expect, it } from "vitest";

import { renderCard, renderErrorCard } from "@/lib/render";
import type { GitHubStats } from "@/lib/types";
import { parseCardParams } from "@/lib/card-params";

const stats: GitHubStats = {
  username: "octocat",
  name: "The Octocat",
  avatarUrl: "",
  bio: null,
  publicRepos: 42,
  followers: 300,
  following: 30,
  totalStars: 5000,
  topLanguages: [{ name: "TypeScript", percent: 100, color: null }],
  contributionsLastYear: 1500,
  currentStreak: 45,
  longestStreak: 60,
    createdAt: "2019-01-01T00:00:00Z",
    mergedPullRequests: 120,
    revivedDormantRepo: true,
    topRepos: [],
  };

describe("renderCard — produces valid SVG", () => {
  it("renders the terminal card", async () => {
    const params = parseCardParams(
      new URLSearchParams({ animate: "false" }),
    );
    const svg = await renderCard(stats, params);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("</svg>");
  });

  it("renders the terminal error card", async () => {
    const params = parseCardParams(new URLSearchParams({}));
    const svg = await renderErrorCard("ghost", "user not found", params);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("</svg>");
  });
});
