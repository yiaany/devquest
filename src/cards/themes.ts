/**
 * Card themes.
 *
 * A theme is a flat palette consumed by the terminal card template. Keeping it
 * a plain data object (no logic) means both the renderer and any tests can
 * reason about colors directly, and Satori only ever sees resolved hex/rgba
 * strings.
 *
 * `macos` is the default (a GitHub-dark-ish terminal). The others are visual
 * riffs on the same layout so the card stays legible on both light and dark
 * README backgrounds.
 */

/** The set of built-in theme names. */
export const THEME_NAMES = ["macos", "matrix", "cyberpunk", "paper"] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

/** The default theme used when none is requested or an invalid one is given. */
export const DEFAULT_THEME: ThemeName = "macos";

/** A resolved color palette for the terminal card. */
export interface CardTheme {
  /** Terminal body background. */
  bg: string;
  /** Title-bar background. */
  titleBar: string;
  /** Window border color. */
  border: string;
  /** Primary foreground (values, main text). */
  fg: string;
  /** Muted foreground (secondary text, separators). */
  muted: string;
  /** Accent used for labels/prompt — the theme's signature color. */
  accent: string;
  /** Error/danger foreground. */
  danger: string;
  /**
   * Whether to draw the macOS "traffic light" dots. Off for themes where a
   * monochrome look reads better (matrix/paper still keep them, but a theme
   * could opt out).
   */
  trafficLights: boolean;
  /** Scanline overlay opacity (0 disables it). */
  scanlineOpacity: number;
  /** True for light backgrounds — flips badge palettes to darker, legible ink. */
  light: boolean;
}

/** The built-in palettes, keyed by name. */
export const THEMES: Record<ThemeName, CardTheme> = {
  // GitHub-dark terminal — the original DevQuest look.
  macos: {
    bg: "#0d1117",
    titleBar: "#161b22",
    border: "#30363d",
    fg: "#c9d1d9",
    muted: "#8b949e",
    accent: "#00ff9c",
    danger: "#ff7b72",
    trafficLights: true,
    scanlineOpacity: 0.05,
    light: false,
  },
  // Phosphor-green CRT.
  matrix: {
    bg: "#001100",
    titleBar: "#002200",
    border: "#00ff41",
    fg: "#39ff14",
    muted: "#1f7a1f",
    accent: "#00ff41",
    danger: "#ff5555",
    trafficLights: false,
    scanlineOpacity: 0.12,
    light: false,
  },
  // Neon on deep purple.
  cyberpunk: {
    bg: "#0d0221",
    titleBar: "#190840",
    border: "#ff2a6d",
    fg: "#d1f7ff",
    muted: "#7a5cff",
    accent: "#05d9e8",
    danger: "#ff2a6d",
    trafficLights: true,
    scanlineOpacity: 0.08,
    light: false,
  },
  // Light "paper" terminal for light READMEs.
  paper: {
    bg: "#faf8f1",
    titleBar: "#ece7da",
    border: "#d8cfba",
    fg: "#2d2a24",
    muted: "#8a8577",
    accent: "#c25b00",
    danger: "#c0392b",
    trafficLights: true,
    scanlineOpacity: 0,
    light: true,
  },
};

/**
 * Resolve a theme by name, falling back to {@link DEFAULT_THEME} for any
 * unknown/invalid value. Never throws.
 */
export function resolveTheme(name: string | null | undefined): CardTheme {
  if (name && (THEME_NAMES as readonly string[]).includes(name)) {
    return THEMES[name as ThemeName];
  }
  return THEMES[DEFAULT_THEME];
}
