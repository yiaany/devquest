/**
 * Streak Flame card — current vs longest streak with a flame motif.
 *
 * Real values only: `currentStreak` and `longestStreak`. A progress bar shows
 * how close the current streak is to the personal best.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel, ProgressBar } from "@/cards/styles/content";

export function renderStreakFlame(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const current = stats.currentStreak;
  const longest = Math.max(longestSafe(stats.longestStreak), current);
  const pct = longest > 0 ? (current / longest) * 100 : 0;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · streak` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Contribution streak" theme={theme} />

        <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
          {/* Flame */}
          <div style={{ display: "flex", width: 60, height: 60, marginRight: 20 }}>
            <svg width={60} height={60} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c2 2 3 4 3 7a5 5 0 0 1-10 0c0-4 4-6 5-14z"
                fill={alpha(accent, 0.25)}
                stroke={accent}
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: accent, fontSize: 56, fontWeight: 700, lineHeight: "56px" }}>
              {`${current}`}
            </span>
            <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
              day current streak
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: theme.fg, fontSize: 13 }}>vs personal best</span>
          <span style={{ color: theme.muted, fontSize: 13, fontWeight: 700 }}>{`${longest}d`}</span>
        </div>
        <ProgressBar percent={pct} theme={theme} accent={accent} height={10} />
      </div>
    </CardFrame>
  );
}

/** Guard: longestStreak should never be negative; clamp to 0. */
function longestSafe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}