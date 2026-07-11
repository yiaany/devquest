/**
 * Shared content primitives for card templates.
 *
 * Small, theme-aware building blocks (stat rows, skill bars, chips, progress,
 * ascii blocks) reused across templates so the individual cards stay short and
 * consistent. All Satori-safe: flex on every multi-child element, inline styles
 * only.
 */

import type { CardTheme } from "@/cards/themes";
import { alpha } from "@/cards/styles/frame";

/** A labelled stat row with a dashed connector and bold value (terminal look). */
export function StatLine({
  label,
  value,
  icon,
  theme,
  accent,
  height = 34,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  theme: CardTheme;
  accent: string;
  height?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", height, marginBottom: 4 }}>
      {icon ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
            }}
          >
            {icon}
          </div>
          <div style={{ display: "flex", width: 12 }} />
        </>
      ) : null}
      <span style={{ color: theme.muted, fontSize: 13 }}>{label}</span>
      <div style={{ display: "flex", width: 8 }} />
      <div
        style={{
          display: "flex",
          flex: 1,
          height: 1,
          borderBottom: `1px dashed ${theme.border}`,
          marginTop: 4,
        }}
      />
      <div style={{ display: "flex", width: 8 }} />
      <span style={{ color: accent, fontSize: 14, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

/** A horizontal progress/skill bar filled to `percent` (0..100) in accent. */
export function ProgressBar({
  percent,
  theme,
  accent,
  height = 8,
  track,
}: {
  percent: number;
  theme: CardTheme;
  accent: string;
  height?: number;
  track?: string;
}) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height,
        borderRadius: height,
        backgroundColor: track ?? alpha(theme.fg, 0.1),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${pct}%`,
          height: "100%",
          borderRadius: height,
          backgroundColor: accent,
        }}
      />
    </div>
  );
}

/** A rounded chip/pill for tags, languages, tech names. */
export function Chip({
  label,
  color,
  theme,
  filled = false,
}: {
  label: string;
  color: string;
  theme: CardTheme;
  filled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10,
        height: 24,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 6,
        border: `1px solid ${filled ? color : alpha(color, 0.5)}`,
        backgroundColor: filled ? color : alpha(color, 0.12),
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: filled ? (theme.light ? "#fff" : "#0a0a0a") : theme.fg,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** A small uppercase section label. */
export function SectionLabel({
  text,
  theme,
}: {
  text: string;
  theme: CardTheme;
}) {
  return (
    <span
      style={{
        color: theme.muted,
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {text}
    </span>
  );
}

/** A colored dot (language/legend swatch). */
export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: color,
        }}
      />
      <div style={{ display: "flex", width: 8 }} />
    </div>
  );
}

/** Render a block of monospace ASCII lines in the accent color. */
export function AsciiBlock({
  lines,
  accent,
  fontSize = 13,
  lineHeight = 24,
}: {
  lines: string[];
  accent: string;
  fontSize?: number;
  lineHeight?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {lines.map((line, idx) => (
        <span
          key={idx}
          style={{ color: accent, fontSize, lineHeight: `${lineHeight}px`, whiteSpace: "pre" }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}

/** A big number + caption pair (hero stat). */
export function BigStat({
  value,
  caption,
  theme,
  accent,
}: {
  value: string;
  caption: string;
  theme: CardTheme;
  accent: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginRight: 28 }}>
      <span style={{ color: accent, fontSize: 34, fontWeight: 700, lineHeight: 1.1 }}>
        {value}
      </span>
      <span style={{ color: theme.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
        {caption}
      </span>
    </div>
  );
}
