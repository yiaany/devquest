/**
 * Guestbook card — a live wall of visitor signatures.
 *
 * Interactive card. The render engine hydrates `ctx.guestbook` with real
 * signatures for the profile owner (from the guestbook store); visitors sign
 * via the `/api/guestbook/:owner` endpoint or the on-site sign form. When no
 * one has signed yet, the card shows a call-to-action instead of an empty wall.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

export function renderGuestbook(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate, guestbook, guestbookTotal } = ctx;

  const entries = guestbook ?? [];
  const hasEntries = entries.length > 0;
  const total = guestbookTotal ?? entries.length;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · guestbook` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel text="Signed the guestbook" theme={theme} />
          <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>
            {total === 1 ? "1 visitor" : `${total} visitors`}
          </span>
        </div>

        {/* Signature wall */}
        {hasEntries ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              marginTop: 6,
            }}
          >
            {entries.slice(0, 6).map((sig, i) => (
              <div
                key={`${sig.name}-${sig.at}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginBottom: 5,
                  borderRadius: 6,
                  backgroundColor: alpha(accent, 0.08),
                  border: `1px solid ${alpha(accent, 0.2)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 6,
                    height: 6,
                    borderRadius: 6,
                    marginRight: 8,
                    backgroundColor: accent,
                  }}
                />
                <span
                  style={{
                    color: accent,
                    fontSize: 12,
                    fontWeight: 700,
                    marginRight: 8,
                  }}
                >
                  {truncate(sig.name, 14)}
                </span>
                {sig.message ? (
                  <span style={{ color: theme.fg, fontSize: 12, opacity: 0.85 }}>
                    {truncate(sig.message, 34)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <span style={{ color: theme.fg, fontSize: 13, opacity: 0.7 }}>
              {"No signatures yet — be the first!"}
            </span>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 32,
            marginTop: 4,
            borderRadius: 8,
            border: `1px dashed ${alpha(accent, 0.5)}`,
          }}
        >
          <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>
            {`sign at devquest → /${stats.username}/sign`}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
