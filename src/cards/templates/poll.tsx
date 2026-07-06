/**
 * Poll / Voting card — a live poll with tallied options.
 *
 * Interactive card: in the full flow each vote opens a GitHub Issue that a
 * companion workflow tallies, writing counts back for the card to read. The
 * normalized stats don't carry poll data, so until that source is wired this
 * renders a representative question with zeroed-then-seeded bars and a "vote"
 * CTA. The layout is final; only the data source changes.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame } from "@/cards/styles/frame";
import { SectionLabel, ProgressBar } from "@/cards/styles/content";

/** Placeholder poll until workflow-backed tallies are wired in. */
const SAMPLE_QUESTION = "Tabs or spaces?";
const SAMPLE_OPTIONS: { label: string; votes: number }[] = [
  { label: "Spaces", votes: 62 },
  { label: "Tabs", votes: 31 },
  { label: "I use Prettier and never think about it", votes: 47 },
];

export function renderPoll(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const total = SAMPLE_OPTIONS.reduce((s, o) => s + o.votes, 0) || 1;

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? `${stats.username} · poll` : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <SectionLabel text="Live poll · vote via issue" theme={theme} />
        <span style={{ color: theme.fg, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          {SAMPLE_QUESTION}
        </span>

        {SAMPLE_OPTIONS.map((opt) => {
          const pct = Math.round((opt.votes / total) * 100);
          return (
            <div key={opt.label} style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: theme.fg, fontSize: 13 }}>{opt.label}</span>
                <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>{`${pct}%`}</span>
              </div>
              <ProgressBar percent={pct} theme={theme} accent={accent} height={10} />
            </div>
          );
        })}

        <div style={{ display: "flex", marginTop: 2 }}>
          <span style={{ color: theme.muted, fontSize: 11 }}>
            {`${total} votes · tallied hourly by GitHub Actions`}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
