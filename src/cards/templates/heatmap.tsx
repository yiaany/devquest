/**
 * Contribution heatmap card.
 *
 * A GitHub-style 7×N grid tinted in the accent color, plus streak/total
 * callouts. Cell intensities come from {@link computeHeatmapCells} — an honest
 * density band derived from real yearly totals + current streak (see derive.ts;
 * the normalized stats don't expose per-day counts).
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel, BigStat } from "@/cards/styles/content";
import { computeHeatmapCells } from "@/cards/derive";
import { formatCount } from "@/cards/primitives";

const WEEKS = 26;

export function renderHeatmap(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const cells = computeHeatmapCells(stats, WEEKS);

  // intensity 0..4 -> alpha
  const levelAlpha = [0.08, 0.3, 0.5, 0.75, 1];

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · contributions` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Last 26 weeks" theme={theme} />

        {/* Heatmap grid: columns = weeks, rows = 7 days */}
        <div style={{ display: "flex", marginBottom: 22 }}>
          {Array.from({ length: WEEKS }).map((_, w) => (
            <div key={w} style={{ display: "flex", flexDirection: "column", marginRight: 3 }}>
              {Array.from({ length: 7 }).map((_, d) => {
                const level = cells[w * 7 + d] ?? 0;
                return (
                  <div
                    key={d}
                    style={{
                      display: "flex",
                      width: 11,
                      height: 11,
                      marginBottom: 3,
                      borderRadius: 2,
                      backgroundColor:
                        level === 0 ? alpha(theme.fg, 0.08) : alpha(accent, levelAlpha[level]),
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Callouts */}
        <div style={{ display: "flex" }}>
          <BigStat
            value={formatCount(stats.contributionsLastYear)}
            caption="contributions / yr"
            theme={theme}
            accent={accent}
          />
          <BigStat value={`${stats.currentStreak}d`} caption="current streak" theme={theme} accent={accent} />
          <BigStat value={`${stats.longestStreak}d`} caption="longest streak" theme={theme} accent={accent} />
        </div>
      </div>
    </CardFrame>
  );
}
