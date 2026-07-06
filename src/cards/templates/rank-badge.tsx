/**
 * Rank Badge card — a gamer-style tier from your activity.
 *
 * Big tier medallion + progress toward the next tier, with the composite score
 * broken down. Tier + score come from {@link computeRank} (derive.ts). Reads
 * best in pixel/neobrutalism.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { ProgressBar } from "@/cards/styles/content";
import { computeRank, RANK_COLORS, RANK_TIERS } from "@/cards/derive";
import { formatCount } from "@/cards/primitives";

export function renderRankBadge(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const rank = computeRank(stats);
  const color = RANK_COLORS[rank.tier];
  const nextIdx = RANK_TIERS.indexOf(rank.tier) + 1;
  const next = RANK_TIERS[nextIdx];

  const contributors: [string, string][] = [
    ["Stars", formatCount(stats.totalStars)],
    ["Followers", formatCount(stats.followers)],
    ["Contributions", formatCount(stats.contributionsLastYear)],
    ["Merged PRs", formatCount(stats.mergedPullRequests)],
  ];

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? "RANK" : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Medallion */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 34 }}>
          <div
            style={{
              display: "flex",
              width: 120,
              height: 120,
              borderRadius: 120,
              border: `4px solid ${color}`,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alpha(color, 0.15),
            }}
          >
            <span style={{ color, fontSize: 40, fontWeight: 700 }}>
              {rank.tier.charAt(0)}
            </span>
          </div>
          <span style={{ color, fontSize: 18, fontWeight: 700, marginTop: 10, letterSpacing: 1 }}>
            {rank.tier.toUpperCase()}
          </span>
        </div>

        {/* Progress + breakdown */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: theme.muted, fontSize: 12 }}>
              {next ? `Progress to ${next}` : "Max tier reached"}
            </span>
            <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>{`${rank.progress}%`}</span>
          </div>
          <div style={{ display: "flex", marginBottom: 18 }}>
            <ProgressBar percent={rank.progress} theme={theme} accent={color} height={12} />
          </div>

          {contributors.map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: theme.muted, fontSize: 12, width: 130 }}>{k}</span>
              <span style={{ color: theme.fg, fontSize: 13, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}
