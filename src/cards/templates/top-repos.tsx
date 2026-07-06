/**
 * Top Repositories card — the user's three most-starred repos, ranked.
 *
 * Reads `stats.topRepos` (already sorted by stars desc). Each row shows a rank
 * badge, the repo name, and its star count with an icon.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { renderStatIcon } from "@/cards/styles/icons";
import { formatCount, truncate } from "@/cards/primitives";

export function renderTopRepos(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const repos = stats.topRepos.slice(0, 3);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · top repos` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Most-starred repositories" theme={theme} />

        {repos.length === 0 ? (
          <span style={{ color: theme.muted, fontSize: 14 }}>No public repositories to display.</span>
        ) : (
          repos.map((repo, i) => (
            <div
              key={repo.name}
              style={{
                display: "flex",
                alignItems: "center",
                height: 52,
                paddingLeft: 14,
                paddingRight: 16,
                marginBottom: 10,
                borderRadius: 8,
                backgroundColor: alpha(accent, i === 0 ? 0.16 : 0.07),
                border: `1px solid ${alpha(accent, i === 0 ? 0.4 : 0.15)}`,
              }}
            >
              {/* Rank */}
              <span style={{ color: accent, fontSize: 20, fontWeight: 700, width: 34 }}>
                {`#${i + 1}`}
              </span>
              {/* Name */}
              <span style={{ color: theme.fg, fontSize: 16, fontWeight: 700, flex: 1 }}>
                {truncate(repo.name, 30)}
              </span>
              {/* Stars */}
              <div style={{ display: "flex", width: 18, height: 18, marginRight: 8 }}>
                {renderStatIcon("stars", accent, 18)}
              </div>
              <span style={{ color: theme.fg, fontSize: 15, fontWeight: 700 }}>
                {formatCount(repo.stars)}
              </span>
            </div>
          ))
        )}
      </div>
    </CardFrame>
  );
}
