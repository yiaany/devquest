/**
 * Dev Receipt card — your GitHub stats printed like a store receipt.
 *
 * Playful but honest: every line item is a real aggregate value; the "total"
 * is the sum of the core counts. No synthetic data. Monospace receipt look
 * fits the terminal font perfectly.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { formatCount, accountAgeYears } from "@/cards/primitives";

export function renderReceipt(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const items: { label: string; value: number }[] = [
    { label: "PUBLIC REPOS", value: stats.publicRepos },
    { label: "FOLLOWERS", value: stats.followers },
    { label: "TOTAL STARS", value: stats.totalStars },
    { label: "CONTRIB / YR", value: stats.contributionsLastYear },
    { label: "MERGED PRS", value: stats.mergedPullRequests },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);
  const years = accountAgeYears(stats.createdAt);

  const line = (label: string, value: string, bold = false) => (
    <div
      key={label}
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
      }}
    >
      <span style={{ color: bold ? accent : theme.muted, fontSize: 13, fontWeight: bold ? 700 : 400 }}>
        {label}
      </span>
      <span style={{ color: bold ? accent : theme.fg, fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  );

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · receipt` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: theme.fg, fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
            DEVQUEST MARKET
          </span>
          <span style={{ color: theme.muted, fontSize: 11 }}>
            {`CUSTOMER: @${stats.username}  ·  MEMBER ${years}Y`}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            height: 1,
            borderBottom: `1px dashed ${alpha(theme.fg, 0.4)}`,
            marginBottom: 10,
          }}
        />

        {items.map((i) => line(i.label, formatCount(i.value)))}

        <div
          style={{
            display: "flex",
            height: 1,
            borderBottom: `1px dashed ${alpha(theme.fg, 0.4)}`,
            marginTop: 4,
            marginBottom: 10,
          }}
        />

        {line("TOTAL SCORE", formatCount(total), true)}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <span style={{ color: theme.muted, fontSize: 11, letterSpacing: 1 }}>
            {"*** THANK YOU FOR COMMITTING ***"}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
