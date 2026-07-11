/**
 * Daily Focus card — a rotating developer quote.
 *
 * Deterministic daily pick (stable per user per day) from {@link pickQuote}.
 * Clean and quiet; reads best in minimal/terminal.
 */

import type { CardContext } from "@/cards/context";
import { CardFrame, alpha } from "@/cards/styles/frame";
import { pickQuote } from "@/cards/derive";

export function renderQuote(ctx: CardContext): React.ReactNode {
  const { stats, theme, accent, artStyle, animate } = ctx;
  const q = pickQuote(stats.username);

  return (
    <CardFrame
      artStyle={artStyle}
      theme={theme}
      accent={accent}
      title={ctx.title === "devquest" ? "DAILY FOCUS" : ctx.title}
      animate={animate}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        {/* Big opening quote mark */}
        <span style={{ color: alpha(accent, 0.5), fontSize: 64, fontWeight: 700, lineHeight: 1 }}>
          &ldquo;
        </span>
        <span style={{ color: theme.fg, fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginTop: 8 }}>
          {q.text}
        </span>
        <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
          <div style={{ display: "flex", width: 28, height: 2, backgroundColor: accent, marginRight: 10 }} />
          <span style={{ color: accent, fontSize: 14, fontWeight: 700 }}>{q.author}</span>
        </div>
      </div>
    </CardFrame>
  );
}
