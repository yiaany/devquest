/**
 * Repo Stats card — stars / forks / issues for one repository.
 *
 * The normalized stats expose `topRepos` (name + stars). We surface the repo
 * whose name matches `params.title` when it looks like a repo selector,
 * otherwise the top-starred repo, and present its headline numbers. Forks/issues
 * aren't in the normalized shape, so we show what we honestly have (name +
 * stars) alongside the owner's totals for context.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { renderStatIcon } from "@/cards/styles/icons";
import { formatCount, truncate } from "@/cards/primitives";

export function renderRepoStats(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate, params } = ctx;

  // Choose the repo: exact name match on the title param, else top repo.
  const wanted = params.title && params.title !== "devquest" ? params.title.toLowerCase() : null;
  const repo =
    (wanted && stats.topRepos.find((r) => r.name.toLowerCase() === wanted)) ||
    stats.topRepos[0] ||
    null;

  const title = repo ? `${stats.username}/${truncate(repo.name, 20)}` : `${stats.username} · repos`;

  const rows = repo
    ? [
        { key: "stars", label: "Stars", value: formatCount(repo.stars) },
        { key: "repos", label: "Owner repos", value: formatCount(stats.publicRepos) },
        { key: "stars", label: "Owner total stars", value: formatCount(stats.totalStars) },
        { key: "followers", label: "Owner followers", value: formatCount(stats.followers) },
      ]
    : [];

  return (
    <CardFrame artStyle={artStyle} theme={theme} accent={accent} title={title} animate={animate}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        {repo ? (
          <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", width: 24, height: 24 }}>
                {renderStatIcon("repos", accent, 24)}
              </div>
              <div style={{ display: "flex", width: 12 }} />
              <div style={{ display: "flex", color: theme.fg, fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
                {truncate(repo.name, 28)}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", width: "100%", marginTop: 8 }}>
              {rows.map((row, i) => (
                <div
                  key={`${row.key}-${i}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", width: 14, height: 14 }}>
                      {renderStatIcon(row.key, accent, 14)}
                    </div>
                    <div style={{ display: "flex", width: 8 }} />
                    <span style={{ color: theme.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                      {row.label}
                    </span>
                  </div>
                  <span style={{ color: theme.fg, fontSize: 18, fontWeight: 700, marginTop: 4 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <span style={{ color: theme.muted, fontSize: 14 }}>No public repositories to display.</span>
        )}
      </div>
    </CardFrame>
  );
}
