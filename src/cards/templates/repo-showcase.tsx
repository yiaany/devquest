/**
 * Repo Showcase card — a single spotlighted repo with its stars.
 *
 * Highlights the #1 most-starred repo as a large feature block, with the
 * runner-up listed below. Real `topRepos` data only.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { renderStatIcon } from "@/cards/styles/icons";
import { formatCount, truncate } from "@/cards/primitives";

export function renderRepoShowcase(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const [top, ...rest] = stats.topRepos.slice(0, 3);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · showcase` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Featured repository" theme={theme} />

        {!top ? (
          <span style={{ color: theme.muted, fontSize: 13 }}>No public repositories to display.</span>
        ) : (
          <>
            {/* Spotlight */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 18,
                borderRadius: 10,
                backgroundColor: alpha(accent, 0.14),
                border: `1px solid ${alpha(accent, 0.4)}`,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", color: theme.fg, fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
                {truncate(top.name, 32)}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", width: 18, height: 18 }}>
                  {renderStatIcon("stars", accent, 18)}
                </div>
                <div style={{ display: "flex", width: 8 }} />
                <span style={{ color: accent, fontSize: 16, fontWeight: 700 }}>
                  {`${formatCount(top.stars)} stars`}
                </span>
              </div>
            </div>

            {/* Runners-up */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rest.map((r) => (
                <div
                  key={r.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 42,
                    paddingLeft: 14,
                    paddingRight: 16,
                    borderRadius: 8,
                    backgroundColor: alpha(accent, 0.05),
                    border: `1px solid ${alpha(accent, 0.15)}`,
                  }}
                >
                  <span style={{ color: theme.fg, fontSize: 14, fontWeight: 700, flex: 1 }}>
                    {truncate(r.name, 28)}
                  </span>
                  <div style={{ display: "flex", width: 14, height: 14 }}>
                    {renderStatIcon("stars", accent, 14)}
                  </div>
                  <div style={{ display: "flex", width: 6 }} />
                  <span style={{ color: accent, fontSize: 13, fontWeight: 700 }}>
                    {formatCount(r.stars)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CardFrame>
  );
}