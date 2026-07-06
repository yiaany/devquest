/**
 * Terminal card — the flagship template.
 *
 * Split layout: large ASCII art on the left, a structured stat list on the
 * right. The window chrome (title bar, border, shadow) is supplied by the
 * shared {@link CardFrame} so this template only renders the body.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, CURSOR_SENTINEL } from "@/cards/styles/frame";
import { StatLine } from "@/cards/styles/content";
import { renderStatIcon } from "@/cards/styles/icons";
import { resolveAscii } from "@/cards/ascii";
import { formatCount } from "@/cards/primitives";
import { STAT_LABELS, statValue } from "@/cards/stat-values";

export function renderTerminal(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate, params } = ctx;
  const title = `${stats.username}@dev:$${ctx.title}`;
  const asciiArt = resolveAscii(params.ascii);
  const rows = params.stats.map((k) => ({
    key: k,
    label: STAT_LABELS[k],
    value: statValue(k, stats),
  }));

  return (
    <CardFrame artStyle={artStyle} theme={theme} accent={accent} title={title} animate={animate}>
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left: ASCII art */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 290,
            marginRight: 32,
            borderRight: `1px solid ${theme.border}`,
            paddingRight: 32,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
            {asciiArt.map((line, idx) => (
              <span
                key={idx}
                style={{ color: accent, fontSize: 13, lineHeight: "26px", whiteSpace: "pre" }}
              >
                {line}
              </span>
            ))}
            <div
              style={{
                position: "absolute",
                right: -12,
                bottom: 6,
                display: "flex",
                width: 8,
                height: 14,
                backgroundColor: animate ? CURSOR_SENTINEL : theme.fg,
              }}
            />
          </div>
        </div>

        {/* Right: stats */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          {rows.slice(0, 5).map((row) => (
            <StatLine
              key={row.key}
              label={row.label}
              value={row.value}
              icon={renderStatIcon(row.key, accent)}
              theme={theme}
              accent={accent}
              height={38}
            />
          ))}
        </div>
      </div>
    </CardFrame>
  );
}

// Re-export for any callers that still want compact number formatting nearby.
export { formatCount };
