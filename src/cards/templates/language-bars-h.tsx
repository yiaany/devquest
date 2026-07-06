/**
 * Language Ladder card — top languages as full-width stacked rows.
 *
 * Differs from skill-bars: each row is a wide track with the language name
 * overlaid and the percentage at the right, giving a denser "ladder" read.
 * Real `topLanguages` share data only.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

const PALETTE = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#00add8", "#dea584"];

export function renderLanguageLadder(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const langs = stats.topLanguages.slice(0, 6);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · lang ladder` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Language breakdown" theme={theme} />

        {langs.length === 0 ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
        ) : (
          langs.map((l, i) => {
            const color = l.color ?? PALETTE[i % PALETTE.length];
            return (
              <div
                key={l.name}
                style={{
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  height: 26,
                  marginBottom: 8,
                  borderRadius: 6,
                  overflow: "hidden",
                  backgroundColor: alpha(theme.fg, 0.08),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    width: `${Math.max(l.percent, 3)}%`,
                    backgroundColor: alpha(color, 0.5),
                  }}
                />
                <span style={{ color: theme.fg, fontSize: 13, fontWeight: 700, marginLeft: 10, zIndex: 1 }}>
                  {truncate(l.name, 20)}
                </span>
                <div style={{ display: "flex", flex: 1 }} />
                <span style={{ color: theme.fg, fontSize: 12, fontWeight: 700, marginRight: 10, zIndex: 1 }}>
                  {`${l.percent}%`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </CardFrame>
  );
}