/**
 * Follower Ratio card — followers vs following as a split bar + ratio.
 *
 * Real values only: followers, following, and their ratio. The split bar shows
 * the proportion between the two; the headline is the follower/following ratio.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { formatCount } from "@/cards/primitives";

export function renderFollowerRatio(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

  const followers = stats.followers;
  const following = stats.following;
  const total = followers + following || 1;
  const followerPct = (followers / total) * 100;
  const ratio = following === 0 ? followers : followers / following;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · network` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <SectionLabel text="Follower / following balance" theme={theme} />

        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 18 }}>
          <span style={{ color: accent, fontSize: 48, fontWeight: 700, lineHeight: "50px" }}>
            {`${ratio.toFixed(ratio >= 10 ? 0 : 1)}×`}
          </span>
          <span style={{ color: theme.muted, fontSize: 14, marginLeft: 10, marginBottom: 8 }}>
            follower ratio
          </span>
        </div>

        {/* Split bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 16,
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: alpha(theme.fg, 0.1),
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", width: `${followerPct}%`, height: "100%", backgroundColor: accent }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: theme.fg, fontSize: 13 }}>
            {`${formatCount(followers)} followers`}
          </span>
          <span style={{ color: theme.muted, fontSize: 13 }}>
            {`${formatCount(following)} following`}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}