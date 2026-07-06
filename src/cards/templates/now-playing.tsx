/**
 * Now Coding card — a "now playing" music-widget riff for your dev status.
 *
 * The "track" is your primary language; the "artist" is your handle; the
 * progress bar reflects your current streak against your longest (real values).
 * A playful frame over honest data.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { truncate } from "@/cards/primitives";

export function renderNowPlaying(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const lang = stats.topLanguages[0]?.name ?? "Code";
  const longest = Math.max(stats.longestStreak, stats.currentStreak, 1);
  const pct = Math.max(4, Math.min(100, Math.round((stats.currentStreak / longest) * 100)));

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · now coding` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Album art = language monogram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 12,
            marginRight: 24,
            backgroundColor: alpha(accent, 0.18),
            border: `1px solid ${alpha(accent, 0.4)}`,
          }}
        >
          <span style={{ color: accent, fontSize: 40, fontWeight: 700 }}>
            {lang.charAt(0).toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ color: theme.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            ► Now coding
          </span>
          <span style={{ color: theme.fg, fontSize: 24, fontWeight: 700, lineHeight: "28px" }}>
            {truncate(lang, 18)}
          </span>
          <span style={{ color: accent, fontSize: 14, marginBottom: 14 }}>{`@${stats.username}`}</span>

          {/* Scrubber */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 6,
              borderRadius: 6,
              backgroundColor: alpha(theme.fg, 0.12),
              overflow: "hidden",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", width: `${pct}%`, height: "100%", borderRadius: 6, backgroundColor: accent }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: theme.muted, fontSize: 11 }}>{`${stats.currentStreak}d streak`}</span>
            <span style={{ color: theme.muted, fontSize: 11 }}>{`best ${longest}d`}</span>
          </div>
        </div>
      </div>
    </CardFrame>
  );
}
