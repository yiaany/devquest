/**
 * Star Spread card — top repos as proportional star "bubbles".
 *
 * Each of the top repos is a circle whose radius scales with its star count
 * (sqrt scale so area reads proportionally). Real `topRepos` data only.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { formatCount, truncate } from "@/cards/primitives";

export function renderStarSpread(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const repos = stats.topRepos.slice(0, 3);
  const max = Math.max(1, ...repos.map((r) => r.stars));

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · star spread` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Stars across top repositories" theme={theme} />

        {repos.length === 0 ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No public repositories to display.</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flex: 1 }}>
            {repos.map((r) => {
              const d = 40 + Math.round(Math.sqrt(r.stars / max) * 70);
              return (
                <div
                  key={r.name}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 180 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: d,
                      height: d,
                      borderRadius: d,
                      backgroundColor: alpha(accent, 0.18),
                      border: `2px solid ${accent}`,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ color: theme.fg, fontSize: 16, fontWeight: 700 }}>
                      {formatCount(r.stars)}
                    </span>
                  </div>
                  <span style={{ color: theme.muted, fontSize: 12 }}>{truncate(r.name, 16)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CardFrame>
  );
}