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
import { StatLine } from "@/cards/styles/content";
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
              <div style={{ display: "flex", width: 24, height: 24, marginRight: 12 }}>
                {renderStatIcon("repos", accent, 24)}
              </div>
              <span style={{ color: theme.fg, fontSize: 22, fontWeight: 700 }}>
                {truncate(repo.name, 28)}
              </span>
            </div>
            {rows.map((row, i) => (
              <StatLine
                key={`${row.key}-${i}`}
                label={row.label}
                value={row.value}
                icon={renderStatIcon(row.key, accent)}
                theme={theme}
                accent={accent}
                height={36}
              />
            ))}
          </>
        ) : (
          <span style={{ color: theme.muted, fontSize: 14 }}>No public repositories to display.</span>
        )}
      </div>
    </CardFrame>
  );
}
