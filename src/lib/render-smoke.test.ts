import { describe, expect, it } from "vitest";

import { renderCard, renderErrorCard } from "@/lib/render";
import type { GitHubStats } from "@/lib/types";
import { parseCardParams } from "@/lib/card-params";
import { CARDS } from "@/cards/registry";

const stats: GitHubStats = {
  username: "octocat",
  name: "The Octocat",
  avatarUrl: "",
  bio: null,
  publicRepos: 42,
  followers: 300,
  following: 30,
  totalStars: 5000,
  topLanguages: [
    { name: "TypeScript", percent: 55, color: "#3178c6" },
    { name: "Rust", percent: 30, color: "#dea584" },
    { name: "Go", percent: 15, color: "#00add8" },
  ],
  contributionsLastYear: 1500,
  currentStreak: 45,
  longestStreak: 60,
  createdAt: "2019-01-01T00:00:00Z",
  mergedPullRequests: 120,
  revivedDormantRepo: true,
  topRepos: [
    { name: "hyperdrive", stars: 3200 },
    { name: "octo-cli", stars: 1200 },
    { name: "dotfiles", stars: 88 },
  ],
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

  // Every registered card must render through Satori without throwing. This is
  // the real guard: Satori enforces `display:flex` on multi-child nodes and a
  // limited CSS subset, so a template that looks fine can still fail here.
  describe("every registered template renders in each supported art style", () => {
    for (const card of CARDS) {
      for (const style of card.artStyles) {
        it(`${card.id} @ ${style}`, async () => {
          const params = parseCardParams(
            new URLSearchParams({
              template: card.id,
              style,
              animate: "false",
            }),
          );
          const svg = await renderCard(stats, params);
          expect(svg.startsWith("<svg")).toBe(true);
          expect(svg).toContain("</svg>");
        });
      }
    }
  });
});
