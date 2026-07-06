/**
 * Shields card — key stats as a row of shields.io-style label/value badges.
 *
 * Familiar README aesthetic: each badge has a dark label half and an accent
 * value half. Every value is a real aggregate. Reads great inline in a profile.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha, shade } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { formatCount, accountAgeYears } from "@/cards/primitives";

function Shield({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div style={{ display: "flex", height: 30, marginRight: 12, marginBottom: 12, borderRadius: 5, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 12,
          backgroundColor: "#3a3a3a",
        }}
      >
        <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 12,
          backgroundColor: accent,
        }}
      >
        <span style={{ color: shade(accent, -0.55), fontSize: 12, fontWeight: 700 }}>{value}</span>
      </div>
    </div>
  );
}

export function renderShields(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const years = accountAgeYears(stats.createdAt);

  const shields: { label: string; value: string }[] = [
    { label: "repos", value: formatCount(stats.publicRepos) },
    { label: "followers", value: formatCount(stats.followers) },
    { label: "stars", value: formatCount(stats.totalStars) },
    { label: "commits/yr", value: formatCount(stats.contributionsLastYear) },
    { label: "streak", value: `${stats.currentStreak}d` },
    { label: "merged prs", value: formatCount(stats.mergedPullRequests) },
    { label: "since", value: years > 0 ? `${years}y` : "new" },
  ];

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · shields` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text={`@${stats.username} · at a glance`} theme={theme} />
        <div style={{ display: "flex", flexWrap: "wrap", alignContent: "flex-start" }}>
          {shields.map((s) => (
            <Shield key={s.label} label={s.label} value={s.value} accent={accent} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            paddingTop: 12,
            borderTop: `1px solid ${alpha(theme.fg, 0.12)}`,
          }}
        >
          <span style={{ color: theme.muted, fontSize: 11 }}>
            {stats.topLanguages[0] ? `main: ${stats.topLanguages[0].name}` : "keep shipping"}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
