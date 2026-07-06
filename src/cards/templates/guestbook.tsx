/**
 * Guestbook card — a wall of visitor signatures.
 *
 * Interactive card: in the full flow, visitors sign via a GitHub Issue and a
 * companion workflow writes the collected names somewhere the card can read.
 * The normalized stats don't carry that list, so until the data source is wired
 * this renders a representative wall seeded from the owner's handle plus a
 * "sign the guestbook" call-to-action. The layout is final; only the data
 * source changes.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { SectionLabel } from "@/cards/styles/content";
import { truncate } from "@/cards/primitives";

/** Placeholder signatures until the workflow-backed list is wired in. */
const SAMPLE_SIGNERS = [
  "octocat",
  "torvalds",
  "gaearon",
  "sindresorhus",
  "yyx990803",
  "tj",
  "addyosmani",
  "kentcdodds",
  "wesbos",
  "leerob",
];

export function renderGuestbook(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;

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
            {`${SAMPLE_SIGNERS.length} visitors`}
          </span>
        </div>

        {/* Signature wall */}
        <div style={{ display: "flex", flexWrap: "wrap", alignContent: "flex-start", flex: 1 }}>
          {SAMPLE_SIGNERS.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                height: 30,
                paddingLeft: 10,
                paddingRight: 12,
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 6,
                backgroundColor: alpha(accent, 0.1),
                border: `1px solid ${alpha(accent, 0.25)}`,
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
              <span style={{ color: theme.fg, fontSize: 12 }}>{truncate(name, 16)}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 34,
            borderRadius: 8,
            border: `1px dashed ${alpha(accent, 0.5)}`,
          }}
        >
          <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>
            {"+ open an issue to sign"}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
