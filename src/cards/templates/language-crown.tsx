/**
 * Language Crown card — your #1 language as a bold hero, runners-up beneath.
 *
 * Real `topLanguages` data only. The dominant language gets an oversized
 * treatment with its share; the next languages list compactly below.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel, Dot } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

const PALETTE = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#00add8", "#dea584"];

export function renderLanguageCrown(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const langs = stats.topLanguages;
  const top = langs[0];
  const rest = langs.slice(1, 5);
  const topColor = top?.color ?? accent;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · main language` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {!top ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <SectionLabel text="Primary language" theme={theme} />
              <span style={{ color: topColor, fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>
                {truncate(top.name, 14)}
              </span>
              <span style={{ color: theme.fg, fontSize: 22, fontWeight: 700, marginTop: 12 }}>
                {`${top.percent}% of code`}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 240,
                paddingLeft: 24,
                borderLeft: `1px solid ${alpha(theme.fg, 0.15)}`,
              }}
            >
              <SectionLabel text="Also fluent in" theme={theme} />
              {rest.length === 0 ? (
                <span style={{ color: theme.muted, fontSize: 12 }}>—</span>
              ) : (
                rest.map((l, i) => (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", marginBottom: 9 }}>
                    <Dot color={l.color ?? PALETTE[(i + 1) % PALETTE.length]} size={9} />
                    <span style={{ color: theme.fg, fontSize: 13, flex: 1 }}>
                      {truncate(l.name, 14)}
                    </span>
                    <span style={{ color: theme.muted, fontSize: 12 }}>{`${l.percent}%`}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </CardFrame>
  );
}
