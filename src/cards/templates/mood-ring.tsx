/**
 * Commit Mood Ring card.
 *
 * A colored ring + mood label derived from sustained activity (streaks +
 * volume) via {@link computeMood}. The caption is explicit that this reads
 * consistency, not clock time (the normalized stats have no per-commit hours).
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { computeMood } from "@/cards/derive";

const SIZE = 140;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;

export function renderMoodRing(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const mood = computeMood(stats);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? "MOOD RING" : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Ring */}
        <div
          style={{
            display: "flex",
            width: SIZE,
            height: SIZE,
            marginRight: 34,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <defs>
              <linearGradient id="moodgrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={mood.color} />
                <stop offset="100%" stopColor={accent} />
              </linearGradient>
            </defs>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={alpha(theme.fg, 0.1)} strokeWidth={STROKE} />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="url(#moodgrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
        </div>

        {/* Label */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
            {`${stats.username}'s coding mood`}
          </span>
          <span style={{ color: mood.color, fontSize: 30, fontWeight: 700, marginTop: 2, marginBottom: 6 }}>
            {mood.label}
          </span>
          <span style={{ color: theme.fg, fontSize: 13, lineHeight: 1.3 }}>{mood.caption}</span>
        </div>
      </div>
    </CardFrame>
  );
}
