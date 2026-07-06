/**
 * Contribution Gauge card — last-year contributions as a radial gauge.
 *
 * The arc fills relative to a soft 1000-commit reference so the gauge reads
 * well for typical profiles while never overflowing. Center shows the real
 * count; sub-caption shows current streak. All values are real.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { formatCount } from "@/cards/primitives";

const SIZE = 168;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
// 270° sweep (three-quarter dial), starting from lower-left.
const SWEEP = 0.75;
const CIRC = 2 * Math.PI * R;
const REFERENCE = 1000;

export function renderContributionGauge(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const value = stats.contributionsLastYear;
  const frac = Math.max(0, Math.min(1, value / REFERENCE));
  const arcLen = frac * SWEEP * CIRC;
  const trackLen = SWEEP * CIRC;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · contributions` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", position: "relative", width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Track (270° dial) */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={alpha(theme.fg, 0.12)}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${trackLen} ${CIRC - trackLen}`}
              transform={`rotate(135 ${SIZE / 2} ${SIZE / 2})`}
            />
            {/* Value arc */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${CIRC - arcLen}`}
              transform={`rotate(135 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: theme.fg, fontSize: 38, fontWeight: 700, lineHeight: "40px" }}>
              {formatCount(value)}
            </span>
            <span style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
              last year
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginLeft: 40 }}>
          <span style={{ color: accent, fontSize: 30, fontWeight: 700 }}>{`${stats.currentStreak}d`}</span>
          <span style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
            current streak
          </span>
          <span style={{ color: accent, fontSize: 30, fontWeight: 700 }}>{`${stats.longestStreak}d`}</span>
          <span style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
            longest streak
          </span>
        </div>
      </div>
    </CardFrame>
  );
}