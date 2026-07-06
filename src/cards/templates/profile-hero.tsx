/**
 * Profile Hero card — name, handle, bio, and a compact stat strip.
 *
 * A clean "business card" layout using only real profile fields: name, handle,
 * bio, and the core counts. No avatar image fetch (keeps rendering dependency
 * free); a monogram initial stands in for the avatar.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { formatCount, truncate } from "@/cards/primitives";

export function renderProfileHero(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const initial = (stats.name || stats.username || "?").trim().charAt(0).toUpperCase();

  const strip = [
    { value: formatCount(stats.publicRepos), label: "repos" },
    { value: formatCount(stats.followers), label: "followers" },
    { value: formatCount(stats.totalStars), label: "stars" },
  ];

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · profile` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
          {/* Monogram */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 72,
              marginRight: 20,
              backgroundColor: alpha(accent, 0.18),
              border: `2px solid ${accent}`,
            }}
          >
            <span style={{ color: accent, fontSize: 34, fontWeight: 700 }}>{initial}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: theme.fg, fontSize: 26, fontWeight: 700, lineHeight: "28px" }}>
              {truncate(stats.name || stats.username, 22)}
            </span>
            <span style={{ color: accent, fontSize: 14 }}>{`@${stats.username}`}</span>
          </div>
        </div>

        {stats.bio ? (
          <span style={{ color: theme.muted, fontSize: 13, lineHeight: "20px", marginBottom: 18 }}>
            {truncate(stats.bio, 92)}
          </span>
        ) : null}

        <div
          style={{
            display: "flex",
            paddingTop: 16,
            borderTop: `1px solid ${alpha(theme.fg, 0.12)}`,
          }}
        >
          {strip.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", marginRight: 36 }}>
              <span style={{ color: theme.fg, fontSize: 22, fontWeight: 700 }}>{s.value}</span>
              <span style={{ color: theme.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}