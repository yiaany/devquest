/**
 * Polyglot card — how many languages you work across, with the leaders.
 *
 * Hero is the count of distinct languages in `topLanguages`; below, the top
 * three are named with their shares. Real breakdown data only.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel, Dot } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

const PALETTE = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#00add8", "#dea584"];

export function renderPolyglot(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const langs = stats.topLanguages;
  const leaders = langs.slice(0, 3);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · polyglot` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", marginRight: 44 }}>
          <span style={{ color: accent, fontSize: 72, fontWeight: 700, lineHeight: 1 }}>
            {langs.length}
          </span>
          <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
            {langs.length === 1 ? "language" : "languages"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <SectionLabel text="Most used" theme={theme} />
          {leaders.length === 0 ? (
            <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
          ) : (
            leaders.map((l, i) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <Dot color={l.color ?? PALETTE[i % PALETTE.length]} size={10} />
                <span style={{ color: theme.fg, fontSize: 15, fontWeight: 700, flex: 1 }}>
                  {truncate(l.name, 18)}
                </span>
                <span style={{ color: alpha(theme.fg, 0.7), fontSize: 14 }}>{`${l.percent}%`}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </CardFrame>
  );
}