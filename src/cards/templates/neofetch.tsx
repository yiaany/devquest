/**
 * Neofetch card — profile rendered like the `neofetch` CLI dump.
 *
 * Left: an ASCII "distro" logo (reuses the ascii library). Right: `key: value`
 * system-info style rows (user@host, uptime = account age, packages = repos,
 * shell/langs, etc.) drawn from real stats.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { AsciiBlock } from "@/cards/styles/content";
import { resolveAscii } from "@/cards/ascii";
import { formatCount, accountAgeYears, joinYear } from "@/cards/primitives";
import { alpha } from "@/cards/styles/frame";

export function renderNeofetch(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate, params } = ctx;
  const ascii = resolveAscii(params.ascii);
  const topLang = stats.topLanguages[0]?.name ?? "polyglot";
  const age = accountAgeYears(stats.createdAt);

  const rows: [string, string][] = [
    ["OS", `GitHub ${joinYear(stats.createdAt) ?? ""}`.trim()],
    ["Uptime", `${age} year${age === 1 ? "" : "s"}`],
    ["Packages", `${formatCount(stats.publicRepos)} repos`],
    ["Shell", topLang],
    ["Stars", formatCount(stats.totalStars)],
    ["Followers", formatCount(stats.followers)],
    ["Contributions", formatCount(stats.contributionsLastYear)],
    ["Streak", `${stats.currentStreak}d`],
  ];

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={`${stats.username}@github`}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            width: 270,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 28,
          }}
        >
          <AsciiBlock lines={ascii} accent={accent} fontSize={13} lineHeight={24} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", marginBottom: 6 }}>
            <span style={{ color: accent, fontSize: 15, fontWeight: 700 }}>{stats.username}</span>
            <span style={{ color: theme.muted, fontSize: 15 }}>@github</span>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: alpha(theme.fg, 0.14),
              marginBottom: 10,
            }}
          />
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", marginBottom: 5 }}>
              <span style={{ color: accent, fontSize: 12.5, fontWeight: 700, width: 118 }}>{k}</span>
              <span style={{ color: theme.fg, fontSize: 12.5 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}
