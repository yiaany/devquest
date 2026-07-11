/**
 * Merged PR card — lifetime merged pull requests as the hero contribution stat.
 *
 * Real value only: `mergedPullRequests` (token-gated; 0 when unavailable). Shows
 * a graceful note when the count is zero rather than pretending.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { formatCount } from "@/cards/primitives";

export function renderPrBadge(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const prs = stats.mergedPullRequests;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · pull requests` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Merged pull requests" theme={theme} />

        <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
          {/* Merge glyph */}
          <div style={{ display: "flex", width: 56, height: 56, marginRight: 20 }}>
            <svg width={56} height={56} viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="6" r="3" stroke={accent} strokeWidth="2" />
              <circle cx="6" cy="18" r="3" stroke={accent} strokeWidth="2" />
              <circle cx="18" cy="15" r="3" stroke={accent} strokeWidth="2" />
              <path d="M6 9v6" stroke={accent} strokeWidth="2" />
              <path d="M6 12h6a3 3 0 0 0 3-3V9" stroke={accent} strokeWidth="2" />
            </svg>
          </div>
          <span style={{ color: accent, fontSize: 64, fontWeight: 700, lineHeight: 1 }}>
            {formatCount(prs)}
          </span>
        </div>

        <span style={{ color: theme.muted, fontSize: 14 }}>
          {prs > 0
            ? `${formatCount(prs)} contributions merged into open source`
            : "Merged PR data not available for this profile"}
        </span>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${alpha(theme.fg, 0.12)}`,
          }}
        >
          <span style={{ color: theme.muted, fontSize: 12 }}>
            {`${formatCount(stats.publicRepos)} public repos · ${formatCount(stats.totalStars)} stars`}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}