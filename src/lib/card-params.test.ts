import { describe, expect, it } from "vitest";

import {
  DEFAULT_STAT_KEYS,
  parseCardParams,
  type CardParams,
} from "@/lib/card-params";

/** Build params from a query string for terse assertions. */
function parse(qs: string): CardParams {
  return parseCardParams(new URLSearchParams(qs));
}

describe("parseCardParams", () => {
  it("returns safe defaults for an empty query", () => {
    const p = parse("");
    expect(p.theme).toBe("macos");
    expect(p.accent).toBeNull();
    expect(p.stats).toEqual(DEFAULT_STAT_KEYS);
    expect(p.animate).toBe(true);
  });

  describe("theme", () => {
    it("accepts a known theme", () => {
      expect(parse("theme=matrix").theme).toBe("matrix");
    });

    it("is case-insensitive and trims", () => {
      expect(parse("theme=%20CyberPunk%20").theme).toBe("cyberpunk");
    });

    it("falls back to macos for an unknown theme", () => {
      expect(parse("theme=vaporwave").theme).toBe("macos");
    });
  });

  describe("accent", () => {
    it("normalizes a bare 6-digit hex by adding '#'", () => {
      expect(parse("accent=ff8800").accent).toBe("#ff8800");
    });

    it("accepts a 3-digit hex with '#'", () => {
      expect(parse("accent=%23f80").accent).toBe("#f80");
    });

    it("rejects invalid hex (returns null)", () => {
      expect(parse("accent=notacolor").accent).toBeNull();
      expect(parse("accent=%23gggggg").accent).toBeNull();
      expect(parse("accent=12345").accent).toBeNull();
    });
  });

  describe("stats", () => {
    it("keeps known keys in requested order", () => {
      expect(parse("stats=stars,repos,prs").stats).toEqual([
        "stars",
        "repos",
        "prs",
      ]);
    });

    it("drops unknown keys and de-duplicates", () => {
      expect(parse("stats=stars,bogus,stars,followers").stats).toEqual([
        "stars",
        "followers",
      ]);
    });

    it("falls back to defaults when nothing valid remains", () => {
      expect(parse("stats=bogus,nope").stats).toEqual(DEFAULT_STAT_KEYS);
    });
  });

  describe("animate", () => {
    it("parses truthy/falsy spellings", () => {
      expect(parse("animate=false").animate).toBe(false);
      expect(parse("animate=0").animate).toBe(false);
      expect(parse("animate=off").animate).toBe(false);
      expect(parse("animate=true").animate).toBe(true);
      expect(parse("animate=1").animate).toBe(true);
    });

    it("defaults to true for unrecognized values", () => {
      expect(parse("animate=maybe").animate).toBe(true);
    });
  });
});
