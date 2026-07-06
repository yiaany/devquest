/**
 * Tech Stack Grid card.
 *
 * The user's top languages as a bold grid of chips, sized so the dominant
 * language reads as primary. Reads best in neobrutalism.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { SectionLabel, Chip } from "@/cards/styles/content";

const PALETTE = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#00add8", "#dea584", "#89e051", "#f34b7d"];

export function renderTechStack(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const langs = stats.topLanguages.slice(0, 8);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? "TECH STACK" : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text={`${stats.username} · toolbelt`} theme={theme} />

        {langs.length === 0 ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", alignContent: "flex-start" }}>
            {langs.map((l, i) => (
              <Chip
                key={l.name}
                label={`${l.name} · ${l.percent}%`}
                color={l.color ?? PALETTE[i % PALETTE.length]}
                theme={theme}
                filled={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </CardFrame>
  );
}
