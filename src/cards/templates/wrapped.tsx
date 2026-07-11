/**
 * Dev Wrapped card — a Spotify-Wrapped-style yearly recap.
 *
 * Big headline stat, top language with a share bar, and a row of secondary
 * numbers. Reads best in the glass art style.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { ProgressBar, BigStat } from "@/cards/styles/content";
import { formatCount, joinYear } from "@/cards/primitives";

export function renderWrapped(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const top = stats.topLanguages[0];
  const year = new Date().getUTCFullYear();

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · wrapped` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}>
          {`Your ${year} in code`}
        </span>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 6, marginBottom: 18 }}>
          <span style={{ color: accent, fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            {formatCount(stats.contributionsLastYear)}
          </span>
          <span style={{ color: theme.fg, fontSize: 16, marginLeft: 10, marginBottom: 8 }}>
            contributions
          </span>
        </div>

        {/* Top language */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: theme.fg, fontSize: 13 }}>
              {top ? `#1 language · ${top.name}` : "top language"}
            </span>
            <span style={{ color: accent, fontSize: 13, fontWeight: 700 }}>
              {top ? `${top.percent}%` : "—"}
            </span>
          </div>
          <ProgressBar percent={top?.percent ?? 0} theme={theme} accent={top?.color ?? accent} height={10} />
        </div>

        {/* Secondary row */}
        <div style={{ display: "flex" }}>
          <BigStat value={`${stats.longestStreak}d`} caption="longest streak" theme={theme} accent={accent} />
          <BigStat value={formatCount(stats.totalStars)} caption="stars earned" theme={theme} accent={accent} />
          <BigStat value={formatCount(stats.followers)} caption="followers" theme={theme} accent={accent} />
          <BigStat
            value={`'${String(joinYear(stats.createdAt) ?? "").slice(-2)}`}
            caption="joined"
            theme={theme}
            accent={accent}
          />
        </div>
      </div>
    </CardFrame>
  );
}
