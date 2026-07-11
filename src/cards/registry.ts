/**
 * Card registry — the manifest of every card DevQuest can render.
 *
 * This is the single source of truth the gallery, the constructor, and the
 * render dispatcher all read from (the shadcn/21st.dev "registry" model). Each
 * entry is pure metadata + a `render(ctx)` function; adding a card is a matter
 * of appending one entry, and the gallery/constructor pick it up automatically.
 *
 * Templates live in `@/cards/templates/*` and are imported here. Keeping the
 * render function on the entry (rather than a giant switch elsewhere) means the
 * registry stays the only place that knows the full card list.
 */

import type { CardContext } from "@/cards/context";
import { ART_STYLES, type ArtStyle } from "@/cards/styles/frame";

import { renderTerminal } from "@/cards/templates/terminal";
import { renderNeofetch } from "@/cards/templates/neofetch";
import { renderHeatmap } from "@/cards/templates/heatmap";
import { renderWrapped } from "@/cards/templates/wrapped";
import { renderIdCard } from "@/cards/templates/id-card";
import { renderRankBadge } from "@/cards/templates/rank-badge";
import { renderLanguageDonut } from "@/cards/templates/language-donut";
import { renderTechStack } from "@/cards/templates/tech-stack";
import { renderSkillBars } from "@/cards/templates/skill-bars";
import { renderCodeWeather } from "@/cards/templates/code-weather";
import { renderMoodRing } from "@/cards/templates/mood-ring";
import { renderQuote } from "@/cards/templates/quote";
import { renderTopRepos } from "@/cards/templates/top-repos";
import { renderGuestbook } from "@/cards/templates/guestbook";
import { renderPoll } from "@/cards/templates/poll";
// Profile & stats
import { renderProfileHero } from "@/cards/templates/profile-hero";
import { renderStatGrid } from "@/cards/templates/stat-grid";
import { renderStatSpark } from "@/cards/templates/stat-spark";
import { renderAccountAge } from "@/cards/templates/account-age";
import { renderFollowerRatio } from "@/cards/templates/follower-ratio";
import { renderContributionGauge } from "@/cards/templates/contribution-gauge";
import { renderStreakFlame } from "@/cards/templates/streak-flame";
import { renderPrBadge } from "@/cards/templates/pr-badge";
import { renderReceipt } from "@/cards/templates/receipt";
import { renderShields } from "@/cards/templates/shields";
// Stack & skills
import { renderLanguageLadder } from "@/cards/templates/language-bars-h";
import { renderPolyglot } from "@/cards/templates/polyglot";
import { renderLanguageCrown } from "@/cards/templates/language-crown";
// Vibe & content
import { renderNowPlaying } from "@/cards/templates/now-playing";
// Repository
import { renderStarsPerRepo } from "@/cards/templates/stars-per-repo";
import { renderStarSpread } from "@/cards/templates/repo-scatter";

/** Top-level categories used to group cards in the gallery. */
export const CARD_CATEGORIES = [
  "profile",
  "stack",
  "vibe",
  "repo",
  "interactive",
] as const;

export type CardCategory = (typeof CARD_CATEGORIES)[number];

/** Human labels for each category (UI). */
export const CATEGORY_LABELS: Record<CardCategory, string> = {
  profile: "Profile & Stats",
  stack: "Stack & Skills",
  vibe: "Vibe & Content",
  repo: "Repository",
  interactive: "Interactive",
};

/** Which customization controls a card exposes in the constructor. */
export interface CardControls {
  /** Card uses the `stats` selection (which stat keys, in order). */
  stats?: boolean;
  /** Card uses the `ascii` art index. */
  ascii?: boolean;
  /** Card uses a custom `title`. */
  title?: boolean;
  /** Card renders per-repo data and needs a `repo` param. */
  repo?: boolean;
}

/** A single registered card. */
export interface CardEntry {
  /** Stable id used in URLs (`?template=<id>`). */
  id: string;
  /** Display name. */
  name: string;
  /** One-line description for the gallery. */
  description: string;
  /** Grouping category. */
  category: CardCategory;
  /** Art styles this card supports (subset of ART_STYLES). */
  artStyles: ArtStyle[];
  /** The art style shown by default in the gallery preview. */
  defaultArtStyle: ArtStyle;
  /** Which constructor controls apply. */
  controls: CardControls;
  /**
   * Whether this card needs a companion GitHub Action / workflow to update its
   * data (interactive cards). When true the constructor shows a setup snippet.
   */
  interactive?: boolean;
  /** Render the card body for a resolved context. */
  render: (ctx: CardContext) => React.ReactNode;
}

/**
 * The full card registry. Order here is the order shown in the gallery within
 * each category.
 */
export const CARDS: CardEntry[] = [
  // ── Profile & Stats ──────────────────────────────────────────────
  {
    id: "terminal",
    name: "Terminal",
    description: "The classic DevQuest terminal window: ASCII art + your key stats.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "terminal",
    controls: { stats: true, ascii: true, title: true },
    render: renderTerminal,
  },
  {
    id: "neofetch",
    name: "Neofetch",
    description: "Your profile as a `neofetch` dump — distro logo beside system info.",
    category: "profile",
    artStyles: ["terminal", "pixel", "minimal", "glass"],
    defaultArtStyle: "terminal",
    controls: { stats: true, ascii: true, title: true },
    render: renderNeofetch,
  },
  {
    id: "heatmap",
    name: "Contribution Heatmap",
    description: "A year of contributions as an accent-tinted heatmap with streak.",
    category: "profile",
    artStyles: ["minimal", "terminal", "glass", "neobrutalism"],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderHeatmap,
  },
  {
    id: "wrapped",
    name: "Dev Wrapped",
    description: "Spotify-Wrapped-style yearly recap: top language, streak, totals.",
    category: "profile",
    artStyles: ["glass", "neobrutalism", "minimal"],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderWrapped,
  },
  {
    id: "id-card",
    name: "Dev ID Card",
    description: "An employee-badge style pass: handle, member-since, rank, barcode.",
    category: "profile",
    artStyles: ["neobrutalism", "minimal", "glass"],
    defaultArtStyle: "neobrutalism",
    controls: { title: true },
    render: renderIdCard,
  },
  {
    id: "rank-badge",
    name: "Rank Badge",
    description: "A gamer-style tier (Bronze→Diamond) computed from your activity.",
    category: "profile",
    artStyles: ["pixel", "neobrutalism", "glass", "terminal"],
    defaultArtStyle: "pixel",
    controls: { title: true },
    render: renderRankBadge,
  },
  {
    id: "profile-hero",
    name: "Profile Hero",
    description: "A clean business-card: monogram, name, bio, and a stat strip.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderProfileHero,
  },
  {
    id: "stat-grid",
    name: "Stat Grid",
    description: "Six key metrics as a bold 2×3 grid of hero numbers.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderStatGrid,
  },
  {
    id: "stat-spark",
    name: "Momentum",
    description: "Core stats as relative spark-bars — see where your weight sits.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "terminal",
    controls: { title: true },
    render: renderStatSpark,
  },
  {
    id: "receipt",
    name: "Dev Receipt",
    description: "Your stats printed like a store receipt, with a grand total.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderReceipt,
  },
  {
    id: "shields",
    name: "Shields",
    description: "README-style label/value shields for every core stat.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderShields,
  },
  {
    id: "account-age",
    name: "Veteran",
    description: "Account age as the hero, with join year and lifetime totals.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderAccountAge,
  },
  {
    id: "follower-ratio",
    name: "Network",
    description: "Followers vs following as a split bar and follower ratio.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderFollowerRatio,
  },
  {
    id: "contribution-gauge",
    name: "Contribution Gauge",
    description: "Last-year contributions as a radial gauge with streak stats.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderContributionGauge,
  },
  {
    id: "streak-flame",
    name: "Streak Flame",
    description: "Current streak vs personal best, with a flame motif.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "outrun",
    controls: { title: true },
    render: renderStreakFlame,
  },
  {
    id: "pr-badge",
    name: "Merged PRs",
    description: "Lifetime merged pull requests as the hero contribution stat.",
    category: "profile",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "terminal",
    controls: { title: true },
    render: renderPrBadge,
  },

  // ── Stack & Skills ───────────────────────────────────────────────
  {
    id: "language-donut",
    name: "Language Donut",
    description: "A clean donut chart of your top languages with percentages.",
    category: "stack",
    artStyles: ["minimal", "glass", "terminal", "neobrutalism"],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderLanguageDonut,
  },
  {
    id: "tech-stack",
    name: "Tech Stack Grid",
    description: "Your top languages as a bold grid of tech chips.",
    category: "stack",
    artStyles: ["neobrutalism", "terminal", "glass", "minimal", "pixel"],
    defaultArtStyle: "neobrutalism",
    controls: { title: true },
    render: renderTechStack,
  },
  {
    id: "skill-bars",
    name: "Skill Bars",
    description: "RPG-style proficiency bars derived from your language breakdown.",
    category: "stack",
    artStyles: ["minimal", "terminal", "glass"],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderSkillBars,
  },
  {
    id: "language-ladder",
    name: "Language Ladder",
    description: "Top languages as full-width stacked rows with percentages.",
    category: "stack",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "terminal",
    controls: { title: true },
    render: renderLanguageLadder,
  },
  {
    id: "language-crown",
    name: "Main Language",
    description: "Your #1 language as a bold hero, with runners-up beneath.",
    category: "stack",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderLanguageCrown,
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "How many languages you work across, with the leaders named.",
    category: "stack",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderPolyglot,
  },

  // ── Vibe & Content ───────────────────────────────────────────────
  {
    id: "code-weather",
    name: "Code Weather",
    description: "Turns your recent activity into a daily 'coding forecast'.",
    category: "vibe",
    artStyles: ["glass", "minimal", "neobrutalism", "pixel"],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderCodeWeather,
  },
  {
    id: "mood-ring",
    name: "Commit Mood Ring",
    description: "Your coder chronotype (night owl / early bird) from commit timing.",
    category: "vibe",
    artStyles: ["glass", "neobrutalism", "pixel"],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderMoodRing,
  },
  {
    id: "quote",
    name: "Daily Focus",
    description: "A rotating developer quote + today's focus line.",
    category: "vibe",
    artStyles: ["minimal", "terminal", "glass", "paper" as ArtStyle].filter(
      (s) => (ART_STYLES as readonly string[]).includes(s),
    ) as ArtStyle[],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderQuote,
  },
  {
    id: "now-playing",
    name: "Now Coding",
    description: "A 'now playing' music widget for your dev status and streak.",
    category: "vibe",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "glass",
    controls: { title: true },
    render: renderNowPlaying,
  },

  // ── Repository ───────────────────────────────────────────────────
  {
    id: "top-repos",
    name: "Top Repositories",
    description: "Your three most-starred repositories, ranked.",
    category: "repo",
    artStyles: ["minimal", "terminal", "glass", "neobrutalism"],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderTopRepos,
  },
  {
    id: "stars-per-repo",
    name: "Impact",
    description: "Average stars per repository — your signal density.",
    category: "repo",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderStarsPerRepo,
  },
  {
    id: "repo-scatter",
    name: "Star Spread",
    description: "Top repositories as proportional star bubbles.",
    category: "repo",
    artStyles: [...ART_STYLES],
    defaultArtStyle: "minimal",
    controls: { title: true },
    render: renderStarSpread,
  },

  // ── Interactive ──────────────────────────────────────────────────
  {
    id: "guestbook",
    name: "Guestbook",
    description: "Visitors sign your wall from the web; signatures render live into the card.",
    category: "interactive",
    artStyles: ["neobrutalism", "terminal", "glass", "minimal"],
    defaultArtStyle: "neobrutalism",
    controls: { title: true },
    interactive: true,
    render: renderGuestbook,
  },
  {
    id: "poll",
    name: "Poll / Voting",
    description: "A live poll; each click opens an Issue that a workflow tallies.",
    category: "interactive",
    artStyles: ["minimal", "terminal", "neobrutalism", "glass"],
    defaultArtStyle: "minimal",
    controls: { title: true },
    interactive: true,
    render: renderPoll,
  },
];

/** Map of id -> entry for O(1) lookup by the render dispatcher. */
export const CARD_MAP: Record<string, CardEntry> = Object.fromEntries(
  CARDS.map((c) => [c.id, c]),
);

/** The default card id (backward-compatible with the original single card). */
export const DEFAULT_CARD_ID = "terminal";

/** Resolve a card entry by id, falling back to the default. Never throws. */
export function resolveCard(id: string | null | undefined): CardEntry {
  if (id && CARD_MAP[id]) return CARD_MAP[id];
  return CARD_MAP[DEFAULT_CARD_ID];
}

/** All card ids (for param validation). */
export const CARD_IDS = CARDS.map((c) => c.id);
