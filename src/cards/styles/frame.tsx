/**
 * Art-style frame system.
 *
 * Every DevQuest card is composed of two orthogonal layers:
 *
 *   1. An **art style** (this file) — the window chrome: background, border,
 *      shadow, corner radius, and the title bar. Think of it as the "frame"
 *      around a picture. Five are supported: terminal, neobrutalism, glass,
 *      pixel, minimal.
 *   2. A **card template** (see `@/cards/templates/*`) — the body content:
 *      stats, bars, ASCII, guestbook rows, etc.
 *
 * Because the two are independent, one template rendered in five styles across
 * four themes with any accent yields hundreds of distinct looks from a single
 * data source — the shadcn/21st.dev "one component, many skins" model.
 *
 * Everything here is rendered by Satori (JSX -> SVG), so it obeys Satori's
 * constraints: every element with >1 child sets `display: "flex"`, inline
 * styles only, no external CSS, limited property support.
 */

import type { CardTheme } from "@/cards/themes";
import { FONT_FAMILY, Watermark } from "@/cards/primitives";

/** The set of built-in art styles (the "frame" around a card's content). */
export const ART_STYLES = [
  "terminal",
  "neobrutalism",
  "glass",
  "pixel",
  "minimal",
  "outrun",
  "blueprint",
  "sketch",
  "sticker",
  "tape",
] as const;

export type ArtStyle = (typeof ART_STYLES)[number];

/** The default art style when none is requested or an invalid one is given. */
export const DEFAULT_ART_STYLE: ArtStyle = "terminal";

/** Resolve an art style by name, falling back to the default. Never throws. */
export function resolveArtStyle(name: string | null | undefined): ArtStyle {
  if (name && (ART_STYLES as readonly string[]).includes(name)) {
    return name as ArtStyle;
  }
  return DEFAULT_ART_STYLE;
}

const TRAFFIC_LIGHTS = ["#ff5f56", "#ffbd2e", "#27c93f"] as const;

/** Sentinel fill for the blinking cursor; recolored + animated in render.ts. */
export const CURSOR_SENTINEL = "#010203";

/**
 * Slightly darken/lighten a hex color by mixing toward black/white. Used to
 * derive frame accents (e.g. neobrutalism shadow) from the theme accent without
 * needing a full color library. `amount` in [-1, 1]; negative darkens.
 */
export function shade(hex: string, amount: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  const int = parseInt(m[1], 16);
  let r = (int >> 16) & 0xff;
  let g = (int >> 8) & 0xff;
  let b = int & 0xff;
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** Convert a hex color to an `rgba()` string at the given alpha. */
export function alpha(hex: string, a: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export interface FrameProps {
  artStyle: ArtStyle;
  theme: CardTheme;
  /** Resolved accent (already includes theme fallback). */
  accent: string;
  /** Title-bar / header text. */
  title: string;
  /** Whether to render a blinking cursor in the header (terminal/pixel). */
  animate: boolean;
  /** Body content. */
  children: React.ReactNode;
}

/**
 * Frame chrome descriptor resolved per art style. Kept as plain data so the
 * JSX below stays declarative and each style is easy to eyeball/tune.
 */
interface FrameChrome {
  radius: number;
  borderWidth: number;
  borderColor: string;
  bg: string;
  boxShadow: string;
  /** Padding around the body content. */
  pad: number;
  /** Header renderer. */
  header: React.ReactNode;
  /** Optional decorative background layer rendered behind content. */
  backdrop?: React.ReactNode;
}

/** Build the header/chrome for a given art style. */
function chromeFor(props: FrameProps): FrameChrome {
  const { artStyle, theme, accent, title, animate } = props;
  const { bg, titleBar, border, fg, muted } = theme;

  const cursor = (
    <div
      style={{
        display: "flex",
        width: 8,
        height: 14,
        marginLeft: 8,
        backgroundColor: animate ? CURSOR_SENTINEL : accent,
      }}
    />
  );

  switch (artStyle) {
    case "neobrutalism": {
      return {
        radius: 4,
        borderWidth: 3,
        borderColor: theme.light ? "#111111" : "#000000",
        bg,
        boxShadow: `8px 8px 0px 0px ${theme.light ? "#111111" : shade(accent, -0.3)}`,
        pad: 32,
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 44,
              paddingLeft: 16,
              paddingRight: 16,
              backgroundColor: accent,
              borderBottom: `3px solid ${theme.light ? "#111111" : "#000000"}`,
            }}
          >
            <span
              style={{
                color: theme.light ? "#111111" : "#0a0a0a",
                fontSize: 15,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {title}
            </span>
            <div style={{ display: "flex", flex: 1 }} />
            <span style={{ color: theme.light ? "#111111" : "#0a0a0a", fontSize: 13, fontWeight: 700 }}>
              {"[ dq ]"}
            </span>
          </div>
        ),
      };
    }

    case "glass": {
      return {
        radius: 20,
        borderWidth: 1,
        borderColor: alpha(fg, 0.12),
        bg,
        boxShadow: `0 20px 60px ${alpha("#000000", 0.45)}, inset 0 1px 0 ${alpha("#ffffff", 0.08)}`,
        pad: 34,
        backdrop: (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              // Layered radial-ish glows via two offset blurred blocks.
              background: `linear-gradient(135deg, ${alpha(accent, 0.22)} 0%, ${alpha(bg, 0)} 45%), linear-gradient(315deg, ${alpha(shade(accent, 0.2), 0.16)} 0%, ${alpha(bg, 0)} 50%)`,
            }}
          />
        ),
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 46,
              paddingLeft: 22,
              paddingRight: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 9,
                height: 9,
                borderRadius: 9,
                marginRight: 8,
                backgroundColor: accent,
              }}
            />
            <span style={{ color: fg, fontSize: 13, opacity: 0.85 }}>{title}</span>
          </div>
        ),
      };
    }

    case "pixel": {
      return {
        radius: 0,
        borderWidth: 4,
        borderColor: accent,
        bg,
        // Stepped "pixel" shadow: two hard offsets, no blur.
        boxShadow: `4px 4px 0 ${shade(accent, -0.4)}, 8px 8px 0 ${alpha("#000000", 0.5)}`,
        pad: 30,
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 42,
              paddingLeft: 14,
              paddingRight: 14,
              backgroundColor: accent,
            }}
          >
            <span
              style={{
                color: theme.light ? "#111111" : "#0a0a0a",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {`> ${title}`}
            </span>
            {cursor}
          </div>
        ),
      };
    }

    case "minimal": {
      return {
        radius: 10,
        borderWidth: 1,
        borderColor: border,
        bg,
        boxShadow: theme.light
          ? `0 1px 2px ${alpha("#000000", 0.06)}`
          : `0 1px 2px ${alpha("#000000", 0.4)}`,
        pad: 40,
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 34,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            <span
              style={{
                color: muted,
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {title}
            </span>
          </div>
        ),
      };
    }

    case "outrun": {
      // Synthwave sunset: gradient backdrop + neon border + glow.
      return {
        radius: 14,
        borderWidth: 2,
        borderColor: accent,
        bg,
        boxShadow: `0 0 24px ${alpha(accent, 0.5)}, 0 0 48px ${alpha(shade(accent, 0.3), 0.3)}`,
        pad: 32,
        backdrop: (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: `linear-gradient(180deg, ${alpha(shade(accent, 0.2), 0.25)} 0%, ${alpha(bg, 0)} 40%, ${alpha(accent, 0.18)} 100%)`,
            }}
          />
        ),
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              borderBottom: `2px solid ${alpha(accent, 0.6)}`,
            }}
          >
            <span
              style={{
                color: accent,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              {title}
            </span>
          </div>
        ),
      };
    }

    case "blueprint": {
      // Technical drawing: faint grid on deep blue, thin precise border.
      const ink = theme.light ? "#1d3f72" : "#9ecbff";
      const grid = alpha(ink, 0.14);
      return {
        radius: 2,
        borderWidth: 1,
        borderColor: alpha(ink, 0.5),
        bg,
        boxShadow: `0 6px 24px ${alpha("#000000", 0.35)}`,
        pad: 34,
        backdrop: (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              backgroundColor: alpha(ink, 0.02),
              backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
              backgroundSize: "22px 22px",
            }}
          />
        ),
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 40,
              paddingLeft: 18,
              paddingRight: 18,
              borderBottom: `1px solid ${alpha(ink, 0.4)}`,
            }}
          >
            <span style={{ color: ink, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
              {`FIG. 01 — ${title}`}
            </span>
          </div>
        ),
      };
    }

    case "sketch": {
      // Hand-drawn notebook: dashed "pencil" border, offset ink shadow.
      const ink = theme.light ? "#2d2a24" : fg;
      return {
        radius: 8,
        borderWidth: 2,
        borderColor: ink,
        bg,
        boxShadow: `3px 3px 0 ${alpha(ink, 0.25)}`,
        pad: 32,
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 42,
              paddingLeft: 18,
              paddingRight: 18,
              borderBottom: `2px dashed ${alpha(ink, 0.5)}`,
            }}
          >
            <span style={{ color: ink, fontSize: 14, fontWeight: 700 }}>{`~ ${title} ~`}</span>
          </div>
        ),
      };
    }

    case "sticker": {
      // Playful die-cut sticker: fat rounded border + soft drop shadow.
      return {
        radius: 24,
        borderWidth: 5,
        borderColor: theme.light ? "#ffffff" : accent,
        bg,
        boxShadow: `0 10px 24px ${alpha("#000000", 0.35)}, inset 0 0 0 3px ${alpha(accent, 0.6)}`,
        pad: 30,
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 46,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 28,
                paddingLeft: 12,
                paddingRight: 12,
                borderRadius: 14,
                backgroundColor: accent,
              }}
            >
              <span style={{ color: theme.light ? "#ffffff" : "#0a0a0a", fontSize: 13, fontWeight: 700 }}>
                {title}
              </span>
            </div>
          </div>
        ),
      };
    }

    case "tape": {
      // Scrapbook: card taped down with two translucent "tape" strips.
      const tape = alpha(accent, 0.35);
      return {
        radius: 3,
        borderWidth: 1,
        borderColor: alpha(fg, 0.15),
        bg,
        boxShadow: `0 8px 20px ${alpha("#000000", 0.3)}`,
        pad: 34,
        backdrop: (
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                top: -8,
                left: 40,
                display: "flex",
                width: 90,
                height: 26,
                backgroundColor: tape,
                transform: "rotate(-6deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -8,
                right: 40,
                display: "flex",
                width: 90,
                height: 26,
                backgroundColor: tape,
                transform: "rotate(5deg)",
              }}
            />
          </div>
        ),
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 40,
              paddingLeft: 18,
              paddingRight: 18,
              borderBottom: `1px solid ${alpha(fg, 0.12)}`,
            }}
          >
            <span style={{ color: muted, fontSize: 13, letterSpacing: 1 }}>{title}</span>
          </div>
        ),
      };
    }

    case "terminal":
    default: {
      return {
        radius: 12,
        borderWidth: 1,
        borderColor: border,
        bg,
        boxShadow: `0 8px 30px ${theme.light ? alpha("#000000", 0.06) : alpha("#000000", 0.35)}, 0 0 20px ${alpha(accent, 0.15)}`,
        pad: 36,
        header: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 40,
              paddingLeft: 16,
              paddingRight: 16,
              backgroundColor: titleBar,
              borderBottom: `1px solid ${border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", width: 80 }}>
              {theme.trafficLights &&
                TRAFFIC_LIGHTS.map((color) => (
                  <div
                    key={color}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      marginRight: 6,
                      backgroundColor: color,
                    }}
                  />
                ))}
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "center",
                color: fg,
                fontSize: 13,
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", width: 80, justifyContent: "flex-end" }}>
              {animate ? cursor : null}
            </div>
          </div>
        ),
      };
    }
  }
}

/**
 * The outer frame every card renders inside. Handles the window chrome for the
 * selected art style and lays out a header + padded body. Body content is
 * supplied by the card template as `children`.
 */
export function CardFrame(props: FrameProps) {
  const { theme } = props;
  const chrome = chromeFor(props);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: chrome.bg,
        fontFamily: FONT_FAMILY,
        borderRadius: chrome.radius,
        overflow: "hidden",
        border: `${chrome.borderWidth}px solid ${chrome.borderColor}`,
        boxShadow: chrome.boxShadow,
      }}
    >
      {chrome.backdrop}
      {chrome.header}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: chrome.pad,
        }}
      >
        {props.children}
      </div>
      <Watermark color={theme.muted} inset={14} />
    </div>
  );
}
