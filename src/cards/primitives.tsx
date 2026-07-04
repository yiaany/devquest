/**
 * Shared card primitives.
 *
 * Cross-cutting building blocks used by every card template (terminal, formal,
 * fun): canvas dimensions, the font family name, number/date formatting, and a
 * couple of tiny presentational helpers.
 *
 * Like the templates themselves, the JSX helpers here are rendered by Satori
 * (not the browser), so they obey the same constraints: every element with more
 * than one child sets `display: "flex"`, only inline styles, limited CSS.
 */

/** Card canvas dimensions (px). Every template renders at this fixed size. */
export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 360;

/** The single font family loaded by the render layer (JetBrains Mono). */
export const FONT_FAMILY = "JetBrains Mono";

/**
 * Format a number for compact display: 1234 -> "1,234"? No — we abbreviate.
 * 999 -> "999", 12345 -> "12.3k", 1_500_000 -> "1.5m". Small numbers stay
 * exact; thousands/millions are abbreviated with one (trimmed) decimal.
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${(Math.round(k * 10) / 10).toString()}k`;
  }
  const m = n / 1_000_000;
  return `${(Math.round(m * 10) / 10).toString()}m`;
}

/**
 * Whole-number account age in years from an ISO creation timestamp, relative to
 * `now` (defaults to the current time). Never negative; returns 0 for future or
 * unparseable dates so a card always renders something sane.
 */
export function accountAgeYears(createdAtIso: string, now: Date = new Date()): number {
  const created = new Date(createdAtIso).getTime();
  if (Number.isNaN(created)) return 0;
  const ms = now.getTime() - created;
  if (ms <= 0) return 0;
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
}

/** The join year (e.g. 2015) from an ISO timestamp, or null if unparseable. */
export function joinYear(createdAtIso: string): number | null {
  const d = new Date(createdAtIso);
  return Number.isNaN(d.getTime()) ? null : d.getUTCFullYear();
}

/** Truncate a string to `max` chars, appending "…" when it overflows. */
export function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, Math.max(0, max - 1))}…` : s;
}

/**
 * Footer watermark shared by every card (growth-loop hook).
 *
 * Absolutely positioned in the bottom-right corner so it is removed from the
 * flex flow entirely. This is deliberate: an in-flow watermark with `flex: 1`
 * competes with the card's main content for vertical space and, on dense
 * layouts, causes overlap. Anchoring it out of flow makes every template's
 * body layout deterministic — content lays out against a known bottom inset
 * and the watermark never collides with it.
 *
 * `inset` should match the parent card's padding so the mark aligns with the
 * content edge rather than the raw canvas edge.
 */
export function Watermark({
  color,
  inset = 40,
}: {
  color: string;
  inset?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        right: inset,
        bottom: inset,
        display: "flex",
      }}
    >
      <span style={{ color, fontSize: 11, opacity: 0.6 }}>
        {"// devquest.dev"}
      </span>
    </div>
  );
}
