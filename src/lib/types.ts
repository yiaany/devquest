/**
 * DevQuest — shared domain types.
 *
 * The GitHub-facing types here describe the *normalized* shape DevQuest works
 * with internally, decoupled from the raw REST/GraphQL payloads (those are
 * parsed and validated in `src/lib/github.ts`).
 */

/** A single language slice in the language breakdown. */
export interface LanguageStat {
  /** Language name, e.g. "TypeScript". */
  name: string;
  /** Share of the analyzed code, 0–100, rounded to 1 decimal. */
  percent: number;
  /** GitHub's language color (hex incl. `#`), when known. */
  color: string | null;
}

/**
 * Normalized public statistics for a GitHub user.
 *
 * Everything here is derived from *public* data only. Missing/private data is
 * represented with sensible defaults (0, empty arrays) rather than throwing, so
 * a sparse profile still renders a valid card.
 */
export interface GitHubStats {
  /** Login/handle, e.g. "torvalds". */
  username: string;
  /** Display name, falls back to the login when unset. */
  name: string;
  /** Avatar image URL. */
  avatarUrl: string;
  /** Short bio, or null. */
  bio: string | null;
  /** Number of public repositories. */
  publicRepos: number;
  /** Number of followers. */
  followers: number;
  /** Number of accounts the user follows. */
  following: number;
  /** Sum of stargazers across the user's public repos. */
  totalStars: number;
  /** Top languages by share, already sorted desc and capped. */
  topLanguages: LanguageStat[];
  /** Total contributions in the last year (per GitHub's calendar). */
  contributionsLastYear: number;
  /** Current consecutive-day contribution streak. */
  currentStreak: number;
  /** Longest consecutive-day contribution streak in the last year. */
  longestStreak: number;
  /** Account creation timestamp (ISO 8601). */
  createdAt: string;
  /** Top 3 public repositories of the user, sorted by stars descending. */
  topRepos: { name: string; stars: number }[];
  /**
   * Total merged pull requests authored by the user (lifetime), per GitHub's
   * search index. Token-gated: `0` when no `GITHUB_TOKEN` is configured.
   */
  mergedPullRequests: number;
  /**
   * Whether the user "revived" a dormant repository: pushed a commit after a
   * gap of 1+ year with no commits on its default branch. Detected by scanning
   * default-branch commit history of the most active repos. Token-gated and
   * best-effort: `false` when no `GITHUB_TOKEN` is configured or history is
   * unavailable.
   */
  revivedDormantRepo: boolean;
}
