/**
 * Language Crown card — your #1 language as a bold hero, runners-up beneath.
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
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        {!top ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No language data available.</span>
        ) : (
          <>
            {/* Left Column: Crown language info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                paddingRight: 20,
              }}
            >
              <SectionLabel text="Primary language" theme={theme} />
              <div style={{ display: "flex", height: 16 }} />
              <span
                style={{
                  color: topColor,
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {truncate(top.name, 14)}
              </span>
              <div style={{ display: "flex", height: 12 }} />
              <span
                style={{
                  color: alpha(theme.fg, 0.8),
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {`${top.percent}% of code`}
              </span>
            </div>

            {/* Right Column: Other languages */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 240,
                paddingLeft: 28,
                borderLeft: `1px solid ${alpha(theme.fg, 0.15)}`,
              }}
            >
              <SectionLabel text="Also fluent in" theme={theme} />
              <div style={{ display: "flex", height: 12 }} />
              {rest.length === 0 ? (
                <span style={{ color: theme.muted, fontSize: 12, fontStyle: "italic" }}>No other languages</span>
              ) : (
                rest.map((l, i) => (
                  <div
                    key={l.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      height: 18,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                      <Dot color={l.color ?? PALETTE[(i + 1) % PALETTE.length]} size={8} />
                      <span
                        style={{
                          color: theme.fg,
                          fontSize: 13,
                          marginLeft: 8,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {truncate(l.name, 14)}
                      </span>
                    </div>
                    <span
                      style={{
                        color: theme.muted,
                        fontSize: 12,
                        marginLeft: 8,
                        fontFamily: "monospace",
                      }}
                    >
                      {`${l.percent}%`}
                    </span>
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
