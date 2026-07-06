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
export const THEME_NAMES = [
  "macos",
  "matrix",
  "cyberpunk",
  "paper",
  "dracula",
  "nord",
  "gruvbox",
  "tokyonight",
  "synthwave",
] as const;

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
  // Dracula — the classic purple/pink dark palette.
  dracula: {
    bg: "#282a36",
    titleBar: "#21222c",
    border: "#44475a",
    fg: "#f8f8f2",
    muted: "#6272a4",
    accent: "#bd93f9",
    danger: "#ff5555",
    trafficLights: true,
    scanlineOpacity: 0.04,
    light: false,
  },
  // Nord — arctic, muted blue-grey.
  nord: {
    bg: "#2e3440",
    titleBar: "#3b4252",
    border: "#434c5e",
    fg: "#eceff4",
    muted: "#7b88a1",
    accent: "#88c0d0",
    danger: "#bf616a",
    trafficLights: true,
    scanlineOpacity: 0.03,
    light: false,
  },
  // Gruvbox — warm retro amber on dark brown.
  gruvbox: {
    bg: "#282828",
    titleBar: "#1d2021",
    border: "#504945",
    fg: "#ebdbb2",
    muted: "#a89984",
    accent: "#fabd2f",
    danger: "#fb4934",
    trafficLights: true,
    scanlineOpacity: 0.06,
    light: false,
  },
  // Tokyo Night — deep navy with soft blue accent.
  tokyonight: {
    bg: "#1a1b26",
    titleBar: "#16161e",
    border: "#2f334d",
    fg: "#c0caf5",
    muted: "#565f89",
    accent: "#7aa2f7",
    danger: "#f7768e",
    trafficLights: true,
    scanlineOpacity: 0.05,
    light: false,
  },
  // Synthwave — hot magenta/cyan on midnight indigo.
  synthwave: {
    bg: "#1a1033",
    titleBar: "#241548",
    border: "#ff6ac1",
    fg: "#f4e9ff",
    muted: "#a17fe0",
    accent: "#ff2fd0",
    danger: "#fe4450",
    trafficLights: false,
    scanlineOpacity: 0.1,
    light: false,
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
