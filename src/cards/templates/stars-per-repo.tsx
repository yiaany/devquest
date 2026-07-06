/**
 * Impact Card — average stars per repo as the hero efficiency metric.
 *
 * Real values only: totalStars / publicRepos, plus the raw totals. Frames a
 * developer's "signal density" without inventing any data.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { SectionLabel, BigStat } from "@/cards/styles/content";
import { formatCount } from "@/cards/primitives";

export function renderStarsPerRepo(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const avg = stats.publicRepos > 0 ? stats.totalStars / stats.publicRepos : 0;
  const avgLabel = avg >= 10 ? avg.toFixed(0) : avg.toFixed(1);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · impact` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Average stars per repository" theme={theme} />

        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 24 }}>
          <span style={{ color: accent, fontSize: 60, fontWeight: 700, lineHeight: "62px" }}>
            {avgLabel}
          </span>
          <span style={{ color: theme.fg, fontSize: 16, marginLeft: 12, marginBottom: 10 }}>
            stars / repo
          </span>
        </div>

        <div style={{ display: "flex" }}>
          <BigStat value={formatCount(stats.totalStars)} caption="total stars" theme={theme} accent={accent} />
          <BigStat value={formatCount(stats.publicRepos)} caption="public repos" theme={theme} accent={accent} />
          <BigStat value={formatCount(stats.followers)} caption="followers" theme={theme} accent={accent} />
        </div>
      </div>
    </CardFrame>
  );
}