/**
 * Momentum card — core stats as a horizontal spark-bar comparison.
 *
 * Each real metric is drawn as a bar normalized to the largest value, giving an
 * at-a-glance sense of where a profile's weight sits (stars vs followers vs
 * contributions …). Values are real; bar lengths are relative within the card.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { formatCount } from "@/cards/primitives";

export function renderStatSpark(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const rows = [
    { label: "Repos", value: stats.publicRepos },
    { label: "Followers", value: stats.followers },
    { label: "Stars", value: stats.totalStars },
    { label: "Contrib/yr", value: stats.contributionsLastYear },
    { label: "Merged PRs", value: stats.mergedPullRequests },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · momentum` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Relative footprint" theme={theme} />
        {rows.map((r) => {
          const pct = Math.max(3, Math.round((r.value / max) * 100));
          return (
            <div key={r.label} style={{ display: "flex", alignItems: "center", height: 34, marginBottom: 6 }}>
              <span style={{ color: theme.muted, fontSize: 12, width: 96 }}>{r.label}</span>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: alpha(theme.fg, 0.08),
                  overflow: "hidden",
                  marginRight: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 7,
                    backgroundColor: accent,
                  }}
                />
              </div>
              <span style={{ color: theme.fg, fontSize: 13, fontWeight: 700, width: 56, textAlign: "right" }}>
                {formatCount(r.value)}
              </span>
            </div>
          );
        })}
      </div>
    </CardFrame>
  );
}
