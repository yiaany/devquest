/**
 * Stat Grid card — six key metrics as a 2×3 grid of hero numbers.
 *
 * Pure aggregate read: repos, followers, stars, contributions, streak, PRs.
 * No synthetic data — every cell is a real value from GitHubStats.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { formatCount } from "@/cards/primitives";

export function renderStatGrid(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const cells = [
    { value: formatCount(stats.publicRepos), label: "repos" },
    { value: formatCount(stats.followers), label: "followers" },
    { value: formatCount(stats.totalStars), label: "stars" },
    { value: formatCount(stats.contributionsLastYear), label: "commits / yr" },
    { value: `${stats.currentStreak}d`, label: "streak" },
    { value: formatCount(stats.mergedPullRequests), label: "merged prs" },
  ];

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · stats` : ctx.title}
      animate={animate}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          flex: 1,
          alignContent: "center",
        }}
      >
        {cells.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "33.33%",
              height: 92,
              paddingLeft: 6,
              paddingRight: 6,
              borderLeft: `2px solid ${alpha(accent, 0.4)}`,
              marginBottom: 12,
            }}
          >
            <span style={{ color: theme.fg, fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>
              {c.value}
            </span>
            <span
              style={{
                color: theme.muted,
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </CardFrame>
  );
}