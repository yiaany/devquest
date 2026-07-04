/**
 * TerminalCard — the default "terminal window" card template.
 *
 * Compact 800x360 layout:
 *   - Left column is a large, detailed GitHub/Code-themed ASCII art (exactly 8 lines high, no text).
 *   - Title bar styled as: `<username>@dev:$${title}`.
 *   - Right column is a structured, vertically spaced stats list with clean vector icons.
 *   - Watermark anchored in the bottom-right corner.
 *
 * Rendered by Satori (JSX -> SVG).
 */

import type { CardTheme } from "@/cards/themes";
import { THEMES } from "@/cards/themes";
import { FONT_FAMILY, Watermark } from "@/cards/primitives";

export type TerminalCardStat = {
  label: string;
  value: string;
  key?: string;
};

export type TerminalCardProps = {
  username: string;
  theme?: CardTheme;
  accent?: string;
  animate?: boolean;
  ascii?: number;
  title?: string;
  stats?: TerminalCardStat[];
  errorMessage?: string;
};

const TRAFFIC_LIGHTS = ["#ff5f56", "#ffbd2e", "#27c93f"] as const;

export const CURSOR_SENTINEL = "#010203";

const DEFAULT_STATS: TerminalCardStat[] = [];

/**
 * 10 detailed ASCII arts (exactly 8 lines high, no text).
 */
const ASCII_ARTS: Record<number, string[]> = {
  // 1: Octocat silhouette
  1: [
    "      .---.       .---.      ",
    "     (     \\     /     )     ",
    "      \\     \\   /     /      ",
    "   .---'             '---.   ",
    "  /  o             o  \\  ",
    "  |    __           __    |  ",
    "  \\   (  )  .---.  (  )   /  ",
    "   '---'  (  o o  )  '---'   ",
  ],
  // 2: Mascot (dude \ (^_^) /)
  2: [
    "        \\  (^_^)  /          ",
    "         \\   |   /           ",
    "          \\  |  /            ",
    "           '-|-'             ",
    "             |               ",
    "            / \\              ",
    "           /   \\             ",
    "          /     \\            ",
  ],
  // 3: Git branch graph
  3: [
    "  *---*---*---*---*  [main]  ",
    "       \\                     ",
    "        *---*---*   [dev]    ",
    "             \\               ",
    "              *---*  [feat]  ",
    "             /               ",
    "        *---*                ",
    "       /                     ",
  ],
  // 4: Coffee cup
  4: [
    "       (  )   (  )           ",
    "        )  (   )  (          ",
    "      .-------------.        ",
    "      |             |---.    ",
    "      |   COFFEE    |   |    ",
    "      |             |---'    ",
    "      \\             /        ",
    "       `-----------'         ",
  ],
  // 5: Terminal window
  5: [
    "   ._____________________.   ",
    "   |  bash               |   ",
    "   |=====================|   ",
    "   | $ npm run build     |   ",
    "   | ✓ Compiled.         |   ",
    "   | _                   |   ",
    "   |_____________________|   ",
    "                             ",
  ],
  // 6: Database
  6: [
    "    ._________________.      ",
    "    | [o] [=======]   |      ",
    "    | [o] [=======]   |      ",
    "    |~~~~~~~~~~~~~~~~~|      ",
    "    | [o] [=======]   |      ",
    "    | [o] [=======]   |      ",
    "    |~~~~~~~~~~~~~~~~~|      ",
    "    | [o] [=======]   |      ",
  ],
  // 7: Keyboard block
  7: [
    "   .________________________.",
    "   | [`][1][2][3][4][5][6]  |",
    "   | [Tab][Q][W][E][R][T]   |",
    "   | [Caps][A][S][D][F][G]  |",
    "   | [Shift][Z][X][C][V]    |",
    "   | [Ctrl][Alt][ Space ]   |",
    "   |________________________|",
    "                             ",
  ],
  // 8: Cloud
  8: [
    "            .------.         ",
    "         .-(        )-.      ",
    "        (              )     ",
    "       (   CLOUD INFRA  )    ",
    "        (              )     ",
    "         `------------'      ",
    "          / /  / /  / /      ",
    "                             ",
  ],
  // 9: Star
  9: [
    "             /\\              ",
    "            /  \\             ",
    "      /\\___/    \\___/\\       ",
    "      \\              /       ",
    "       \\   STARDOM  /        ",
    "       /            \\        ",
    "      \\/   \\    /   \\/       ",
    "            \\  /             ",
  ],
  // 10: Code brackets
  10: [
    "         .________.          ",
    "        /  ______  \\         ",
    "       /  /      \\  \\        ",
    "      |  /  </>   \\  |       ",
    "      |  |  CODE  |  |       ",
    "      |  \\        /  |       ",
    "       \\  \\______/  /        ",
    "        \\__________/         ",
  ],
};

/**
 * Render a simple SVG icon based on the stat key.
 * SVG paths are standard Lucide/Octicons, scaled for 15x15 box.
 */
function renderStatIcon(key: string, color: string) {
  const props = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (key) {
    case "repos":
      return (
        <svg {...props}>
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
        </svg>
      );
    case "followers":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "stars":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "contributions":
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "streak":
      return (
        <svg {...props}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case "prs":
      return (
        <svg {...props}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 15V9a4 4 0 0 0-4-4H9" />
          <line x1="6" y1="9" x2="6" y2="15" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
  }
}

export function TerminalCard({
  username,
  theme = THEMES.macos,
  accent: accentOverride,
  animate = true,
  ascii = 1,
  title = "devquest",
  stats = DEFAULT_STATS,
  errorMessage,
}: TerminalCardProps) {
  const { bg, titleBar, border, fg, muted, danger } = theme;
  const accent = accentOverride ?? theme.accent;
  const isError = Boolean(errorMessage);

  const PAD = 36; // Increased padding to distribute elements better

  // Resolve selected ASCII art, fallback to 1 (Octocat).
  const asciiArt = ASCII_ARTS[ascii] ?? ASCII_ARTS[1];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: bg,
        fontFamily: FONT_FAMILY,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${border}`,
        // Accent glow: soft drop shadow matching theme accent
        boxShadow: `0 8px 30px ${theme.light ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.35)"}, 0 0 20px ${accent}25`,
      }}
    >
      {/* Title bar */}
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
          {`${username}@dev:$${title}`}
        </div>
        <div style={{ display: "flex", width: 80 }} />
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: PAD,
          paddingBottom: PAD,
        }}
      >
        {isError ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: 16, color: danger, marginBottom: 8 }}>
              {`error: ${errorMessage}`}
            </div>
            <div style={{ display: "flex", fontSize: 13, color: muted }}>
              {"# check the username or rate limit and try again"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flex: 1 }}>
            {/* Split layout: left Large ASCII art, right stats */}
            <div style={{ display: "flex", flex: 1 }}>
              {/* Left Column (Huge ASCII Art, no text blocks) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 290,
                  marginRight: 32, // Increased spacing
                  borderRight: `1px solid ${border}`,
                  paddingRight: 32, // Increased padding
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                  {asciiArt.map((line, idx) => (
                    <span key={idx} style={{ color: accent, fontSize: 13, lineHeight: "26px", whiteSpace: "pre" }}>
                      {line}
                    </span>
                  ))}
                  {/* Blinking cursor at the absolute bottom-right of the ASCII art container */}
                  <div
                    style={{
                      position: "absolute",
                      right: -12,
                      bottom: 6,
                      display: "flex",
                      width: 8,
                      height: 14,
                      backgroundColor: animate ? CURSOR_SENTINEL : fg,
                    }}
                  />
                </div>
              </div>

              {/* Right Column (Structured Stats with Icons, spread out) */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
                {stats.slice(0, 5).map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: 38, // Increased row height to fill 360px height cleanly
                      marginBottom: 6,
                    }}
                  >
                    {/* Icon (borderless, directly in flow) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        height: 16,
                        marginRight: 14, // Increased spacing
                      }}
                    >
                      {renderStatIcon(stat.key ?? "", accent)}
                    </div>
                    {/* Label */}
                    <span style={{ color: muted, fontSize: 13, marginRight: 8 }}>
                      {stat.label}
                    </span>
                    {/* Connector */}
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        height: 1,
                        borderBottom: `1px dashed ${border}`,
                        marginTop: 4,
                        marginRight: 8,
                      }}
                    />
                    {/* Value */}
                    <span style={{ color: fg, fontSize: 14, fontWeight: 700 }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Watermark color={muted} inset={12} />
    </div>
  );
}

export default TerminalCard;
