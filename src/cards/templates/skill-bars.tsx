/**
 * Skill Bars card — RPG-style proficiency bars.
 *
 * One bar per top language, filled to its share of the analyzed code. The label
 * frames it as a "proficiency" read of the language breakdown (an honest
 * characterization of real share data, not a self-assessed skill rating).
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { SectionLabel, ProgressBar } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

const PALETTE = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#00add8"];

export function renderSkillBars(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const langs = stats.topLanguages.slice(0, 5);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · skills` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Language proficiency · by code share" theme={theme} />

        {langs.length === 0 ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
        ) : (
          langs.map((l, i) => (
            <div key={l.name} style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: theme.fg, fontSize: 13 }}>{truncate(l.name, 18)}</span>
                <span style={{ color: theme.muted, fontSize: 12, fontWeight: 700 }}>{`${l.percent}%`}</span>
              </div>
              <ProgressBar
                percent={l.percent}
                theme={theme}
                accent={l.color ?? PALETTE[i % PALETTE.length]}
                height={8}
              />
            </div>
          ))
        )}
      </div>
    </CardFrame>
  );
}
