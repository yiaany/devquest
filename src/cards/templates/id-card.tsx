/**
 * Dev ID Card — an employee-badge style pass.
 *
 * Left: an avatar placeholder block + name/handle. Right: member-since, rank,
 * and a faux "barcode" generated deterministically from the username. Reads
 * best in neobrutalism.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { computeRank, RANK_COLORS, memberYears } from "@/cards/derive";
import { joinYear, truncate } from "@/cards/primitives";

/** Deterministic barcode: variable-width bars seeded by the username. */
function barcode(username: string): number[] {
  let seed = 7;
  for (let i = 0; i < username.length; i++) seed = (seed * 31 + username.charCodeAt(i)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 42; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    bars.push(1 + (seed % 3)); // width 1..3
  }
  return bars;
}

export function renderIdCard(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const rank = computeRank(stats);
  const rankColor = RANK_COLORS[rank.tier];
  const since = joinYear(stats.createdAt) ?? "—";
  const years = memberYears(stats);
  const bars = barcode(stats.username);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? "DEV ID CARD" : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Avatar placeholder + identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 30 }}>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 8,
              border: `2px solid ${theme.fg}`,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alpha(accent, 0.15),
              marginBottom: 10,
            }}
          >
            <span style={{ color: accent, fontSize: 40, fontWeight: 700 }}>
              {stats.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span
            style={{
              color: theme.light ? "#111" : "#0a0a0a",
              backgroundColor: rankColor,
              fontSize: 11,
              fontWeight: 700,
              paddingLeft: 8,
              paddingRight: 8,
              paddingTop: 2,
              paddingBottom: 2,
              borderRadius: 3,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {rank.tier}
          </span>
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ color: theme.fg, fontSize: 22, fontWeight: 700 }}>
            {truncate(stats.name || stats.username, 22)}
          </span>
          <span style={{ color: theme.muted, fontSize: 13, marginBottom: 14 }}>
            {`@${stats.username}`}
          </span>

          <div style={{ display: "flex", marginBottom: 6 }}>
            <span style={{ color: theme.muted, fontSize: 12, width: 130 }}>MEMBER SINCE</span>
            <span style={{ color: theme.fg, fontSize: 12, fontWeight: 700 }}>{`${since} · ${years}y`}</span>
          </div>
          <div style={{ display: "flex", marginBottom: 16 }}>
            <span style={{ color: theme.muted, fontSize: 12, width: 130 }}>CLEARANCE</span>
            <span style={{ color: rankColor, fontSize: 12, fontWeight: 700 }}>{`LVL ${rank.score}`}</span>
          </div>

          {/* Barcode */}
          <div style={{ display: "flex", alignItems: "flex-end", height: 40 }}>
            {bars.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: w,
                  height: 40,
                  marginRight: 2,
                  backgroundColor: i % 2 === 0 ? theme.fg : "transparent",
                }}
              />
            ))}
          </div>
          <span style={{ color: theme.muted, fontSize: 10, letterSpacing: 4, marginTop: 4 }}>
            {stats.username.toUpperCase()}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
