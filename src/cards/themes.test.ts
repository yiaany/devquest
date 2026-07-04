import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  resolveTheme,
  THEME_NAMES,
  THEMES,
  type CardTheme,
} from "@/cards/themes";

/** Fields every palette must define. */
const REQUIRED_KEYS: (keyof CardTheme)[] = [
  "bg",
  "titleBar",
  "border",
  "fg",
  "muted",
  "accent",
  "danger",
  "trafficLights",
  "scanlineOpacity",
  "light",
];

const HEX = /^#[0-9a-fA-F]{3,8}$/;

describe("THEMES", () => {
  it("defines a palette for every declared name", () => {
    for (const name of THEME_NAMES) {
      expect(THEMES[name]).toBeDefined();
    }
  });

  it("has fully-populated palettes with valid hex colors", () => {
    for (const name of THEME_NAMES) {
      const t = THEMES[name];
      for (const key of REQUIRED_KEYS) {
        expect(t[key], `${name}.${key}`).not.toBeUndefined();
      }
      for (const key of ["bg", "titleBar", "border", "fg", "muted", "accent", "danger"] as const) {
        expect(t[key], `${name}.${key}`).toMatch(HEX);
      }
      expect(t.scanlineOpacity).toBeGreaterThanOrEqual(0);
      expect(t.scanlineOpacity).toBeLessThanOrEqual(1);
    }
  });

  it("marks only the paper theme as light", () => {
    expect(THEMES.paper.light).toBe(true);
    expect(THEMES.macos.light).toBe(false);
    expect(THEMES.matrix.light).toBe(false);
    expect(THEMES.cyberpunk.light).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("resolves a known name", () => {
    expect(resolveTheme("matrix")).toBe(THEMES.matrix);
  });

  it("falls back to the default for unknown/empty/null", () => {
    expect(resolveTheme("nope")).toBe(THEMES[DEFAULT_THEME]);
    expect(resolveTheme("")).toBe(THEMES[DEFAULT_THEME]);
    expect(resolveTheme(null)).toBe(THEMES[DEFAULT_THEME]);
    expect(resolveTheme(undefined)).toBe(THEMES[DEFAULT_THEME]);
  });
});
