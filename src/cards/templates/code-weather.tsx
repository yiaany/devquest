/**
 * Code Weather card — activity as a daily "coding forecast".
 *
 * Condition (Sunny/Cloudy/…) comes from {@link computeWeather} (derive.ts),
 * driven by current streak + yearly contributions. Playful characterization of
 * real freshness signals.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { AsciiBlock, BigStat } from "@/cards/styles/content";
import { computeWeather } from "@/cards/derive";
import { formatCount } from "@/cards/primitives";

export function renderCodeWeather(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const w = computeWeather(stats);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? "CODE WEATHER" : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Glyph */}
        <div
          style={{
            display: "flex",
            width: 190,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 28,
          }}
        >
          <AsciiBlock lines={w.glyph} accent={accent} fontSize={16} lineHeight={22} />
        </div>

        {/* Forecast */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
            {`${stats.username}'s forecast`}
          </span>
          <span style={{ color: accent, fontSize: 30, fontWeight: 700, marginTop: 2, marginBottom: 4 }}>
            {w.label}
          </span>
          <span style={{ color: theme.fg, fontSize: 13, marginBottom: 20 }}>{w.caption}</span>

          <div style={{ display: "flex" }}>
            <BigStat value={`${stats.currentStreak}d`} caption="streak" theme={theme} accent={accent} />
            <BigStat
              value={formatCount(stats.contributionsLastYear)}
              caption="contrib / yr"
              theme={theme}
              accent={accent}
            />
          </div>
        </div>
      </div>
    </CardFrame>
  );
}
