/**
 * Veteran Card — account age as the hero, with join year and a milestone line.
 *
 * Real values only: derived from `createdAt`. Shows whole-year age, the join
 * year, and a compact "member since" band. No synthetic data.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { accountAgeYears, joinYear, formatCount } from "@/cards/primitives";

export function renderAccountAge(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const years = accountAgeYears(stats.createdAt);
  const joined = joinYear(stats.createdAt);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · tenure` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Time on GitHub" theme={theme} />

        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 6 }}>
          <span style={{ color: accent, fontSize: 64, fontWeight: 700, lineHeight: 1 }}>
            {years}
          </span>
          <span style={{ color: theme.fg, fontSize: 20, marginLeft: 12, marginBottom: 10 }}>
            {years === 1 ? "year" : "years"}
          </span>
        </div>

        <span style={{ color: theme.muted, fontSize: 14, marginBottom: 20 }}>
          {joined ? `Member since ${joined}` : "Member of GitHub"}
        </span>

        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: 14,
              paddingRight: 24,
              borderLeft: `2px solid ${alpha(accent, 0.4)}`,
            }}
          >
            <span style={{ color: theme.fg, fontSize: 20, fontWeight: 700 }}>
              {formatCount(stats.publicRepos)}
            </span>
            <span style={{ color: theme.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              repos shipped
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: 14,
              borderLeft: `2px solid ${alpha(accent, 0.4)}`,
            }}
          >
            <span style={{ color: theme.fg, fontSize: 20, fontWeight: 700 }}>
              {formatCount(stats.totalStars)}
            </span>
            <span style={{ color: theme.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              stars earned
            </span>
          </div>
        </div>
      </div>
    </CardFrame>
  );
}