import { describe, expect, it } from "vitest";

import { CURSOR_SENTINEL } from "@/cards/TerminalCard";
import { THEMES } from "@/cards/themes";
import { renderCardToSvg } from "@/lib/render";

/**
 * Integration tests over the *real* Satori output. These guard the fragile
 * string-surgery in postProcessSvg against changes in Satori's serialization:
 * if the cursor sentinel is ever left in the output, the regex stopped
 * matching and the animation/recolor silently broke.
 */
describe("renderCardToSvg (integration)", () => {
  const base = {
    username: "octocat",
    theme: THEMES.macos,
    accent: "#ff8800",
    stats: [{ label: "Repos", value: "42" }],
    achievements: [],
    title: "devquest",
  };

  it("produces valid SVG markup", async () => {
    const svg = await renderCardToSvg({ ...base });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
  });

  it("never leaks the cursor sentinel color into the output", async () => {
    const animated = await renderCardToSvg({ ...base, animate: true });
    const still = await renderCardToSvg({ ...base, animate: false });
    expect(animated).not.toContain(CURSOR_SENTINEL);
    expect(still).not.toContain(CURSOR_SENTINEL);
  });

  it("injects an <animate> blink only when animated", async () => {
    const animated = await renderCardToSvg({ ...base, animate: true });
    const still = await renderCardToSvg({ ...base, animate: false });
    expect(animated).toContain("<animate");
    expect(animated).toContain('attributeName="opacity"');
    expect(still).not.toContain("<animate");
  });

  it("recolors the cursor with the resolved accent", async () => {
    const svg = await renderCardToSvg({ ...base, accent: "#ff8800" });
    expect(svg).toContain("#ff8800");
  });

  it("adds a scanline overlay only for themes that request one", async () => {
    // macOS has a non-zero scanlineOpacity; paper is zero.
    const withScan = await renderCardToSvg({ ...base, theme: THEMES.macos });
    const noScan = await renderCardToSvg({ ...base, theme: THEMES.paper });
    expect(withScan).toContain('id="dq-scan"');
    expect(noScan).not.toContain('id="dq-scan"');
  });

  it("renders an error card without throwing", async () => {
    const svg = await renderCardToSvg({
      username: "ghost",
      theme: THEMES.macos,
      errorMessage: "user not found",
    });
    expect(svg.startsWith("<svg")).toBe(true);
  });
});
