/**
 * Language Donut card.
 *
 * A donut chart of the user's top languages (from real `topLanguages` shares)
 * rendered as SVG stroke-dasharray arcs, with a legend. Satori supports the
 * `<circle>` stroke trick, so we compose the donut from concentric arcs.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel, Dot } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

const SIZE = 150;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/** Fallback palette when GitHub gives no language color. */
const PALETTE = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#00add8", "#dea584"];

export function renderLanguageDonut(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const langs = stats.topLanguages.slice(0, 6);

  // Normalize shares to sum to 100 (topLanguages may not, if capped).
  const total = langs.reduce((s, l) => s + l.percent, 0) || 1;
  const segments = langs.map((l, i) => ({
    name: l.name,
    color: l.color ?? PALETTE[i % PALETTE.length],
    frac: l.percent / total,
    percent: l.percent,
  }));

  // Precompute arc offsets.
  let acc = 0;
  const arcs = segments.map((s) => {
    const dash = s.frac * CIRC;
    const offset = acc;
    acc += dash;
    return { ...s, dash, offset };
  });

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · languages` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Donut */}
        <div
          style={{
            display: "flex",
            width: SIZE,
            height: SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={alpha(theme.fg, 0.1)}
              strokeWidth={STROKE}
            />
            {arcs.map((a) => (
              <circle
                key={a.name}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${CIRC - a.dash}`}
                strokeDashoffset={-a.offset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            ))}
          </svg>
        </div>

        <div style={{ display: "flex", width: 40 }} />

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <SectionLabel text="Top languages" theme={theme} />
          {segments.length === 0 ? (
            <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
          ) : (
            segments.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <Dot color={s.color} />
                <span style={{ color: theme.fg, fontSize: 13, flex: 1 }}>{truncate(s.name, 16)}</span>
                <span style={{ color: theme.muted, fontSize: 13, fontWeight: 700 }}>
                  {`${s.percent}%`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </CardFrame>
  );
}
