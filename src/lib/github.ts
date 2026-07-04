/**
 * GitHub data layer.
 *
 * Fetches and normalizes *public* profile statistics for a given handle.
 *
 * Design notes:
 *   - REST is the always-available path (works unauthenticated, just rate
 *     limited). It provides user info, repos, stars and a language breakdown.
 *   - GitHub's GraphQL API *requires* authentication, so the contribution
 *     calendar + streaks are only fetched when `GITHUB_TOKEN` is set. Without a
 *     token we return sensible defaults (0) rather than failing.
 *   - All external payloads are validated with zod at the boundary before we
 *     trust them.
 *
 * Server-only module — never import into client code (it reads env secrets).
 */

import { z } from "zod";

import type { GitHubStats, LanguageStat } from "@/lib/types";

const REST_API = "https://api.github.com";
const GRAPHQL_API = "https://api.github.com/graphql";

/** Max number of repos to scan for stars/languages (1 page). */
const REPO_SCAN_COUNT = 100;
/** How many languages to keep in the breakdown. */
const TOP_LANGUAGES = 6;

/** Error thrown when a user cannot be found (HTTP 404). */
export class GitHubUserNotFoundError extends Error {
  constructor(public readonly username: string) {
    super(`GitHub user "${username}" not found`);
    this.name = "GitHubUserNotFoundError";
  }
}

/** Error thrown when GitHub rate-limits or forbids the request (403/429). */
export class GitHubRateLimitError extends Error {
  constructor(message = "GitHub API rate limit exceeded. Set GITHUB_TOKEN to raise the limit.") {
    super(message);
    this.name = "GitHubRateLimitError";
  }
}

/** Generic upstream error (unexpected non-OK response). */
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

// ---------------------------------------------------------------------------
// Zod schemas (boundary validation)
// ---------------------------------------------------------------------------

/** Subset of the REST `GET /users/{user}` payload we rely on. */
const userSchema = z.object({
  login: z.string(),
  name: z.string().nullable().optional(),
  avatar_url: z.string(),
  bio: z.string().nullable().optional(),
  public_repos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  created_at: z.string(),
});

/** One repo from `GET /users/{user}/repos`. */
const repoSchema = z.object({
  name: z.string(),
  stargazers_count: z.number().int().nonnegative(),
  language: z.string().nullable(),
  fork: z.boolean(),
});
const repoListSchema = z.array(repoSchema);

/** One day in the GraphQL contribution calendar. */
const contributionDaySchema = z.object({
  contributionCount: z.number().int().nonnegative(),
  date: z.string(),
});

/** A commit node (only its authored date) from a repo's default-branch history. */
const commitNodeSchema = z.object({
  committedDate: z.string(),
});

/**
 * Combined GraphQL response: the contribution calendar, per-repo commit history
 * (for dormant-repo revival detection) and a merged-PR count via search.
 *
 * Every nested piece is optional/nullable because GitHub returns `null` for
 * empty repos (no default branch), users with no repos, etc. — we defensively
 * default to empty rather than failing the whole card.
 */
const extendedSchema = z.object({
  data: z.object({
    user: z
      .object({
        contributionsCollection: z.object({
          contributionCalendar: z.object({
            totalContributions: z.number().int().nonnegative(),
            weeks: z.array(
              z.object({
                contributionDays: z.array(contributionDaySchema),
              }),
            ),
          }),
        }),
        repositories: z.object({
          nodes: z.array(
            z.object({
              defaultBranchRef: z
                .object({
                  target: z
                    .object({
                      history: z
                        .object({ nodes: z.array(commitNodeSchema) })
                        .optional(),
                    })
                    .nullable()
                    .optional(),
                })
                .nullable()
                .optional(),
            }),
          ),
        }),
      })
      .nullable(),
    search: z
      .object({ issueCount: z.number().int().nonnegative() })
      .optional(),
  }),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build request headers, adding auth + API version when a token exists. */
function buildHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevQuest",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Map a non-OK REST response to a typed error. */
function throwForStatus(status: number, context: string): never {
  if (status === 404) {
    // Caller supplies the username via the specific error when relevant.
    throw new GitHubApiError(`${context}: not found`, 404);
  }
  if (status === 403 || status === 429) {
    throw new GitHubRateLimitError();
  }
  throw new GitHubApiError(`${context}: unexpected status ${status}`, status);
}

/**
 * Aggregate a language breakdown from the repo list.
 *
 * Uses each repo's *primary* language (REST doesn't expose byte counts without
 * an extra request per repo). Forks are excluded so the breakdown reflects the
 * user's own work. Returns the top languages by share, summing to ~100%.
 */
function computeLanguageBreakdown(
  repos: z.infer<typeof repoListSchema>,
): LanguageStat[] {
  const counts = new Map<string, number>();
  let total = 0;

  for (const repo of repos) {
    if (repo.fork || !repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    total += 1;
  }

  if (total === 0) return [];

  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / total) * 1000) / 10,
      color: LANGUAGE_COLORS[name] ?? null,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, TOP_LANGUAGES);
}

/**
 * Compute current + longest daily streaks from the contribution calendar.
 *
 * Days are flattened in chronological order. The "current" streak counts back
 * from the most recent day, tolerating a zero on *today* (the day may not be
 * over yet) but breaking on any earlier zero.
 */
function computeStreaks(
  days: { contributionCount: number; date: string }[],
): { current: number; longest: number } {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }

  // Current streak: walk backwards from the end.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      current += 1;
    } else if (i === days.length - 1) {
      // Today with no contributions yet — don't break the streak.
      continue;
    } else {
      break;
    }
  }

  return { current, longest };
}

/**
 * Detect whether any repo was "revived" from dormancy: its default-branch
 * commit history contains a gap of 1+ year between two consecutive commits.
 *
 * History nodes arrive newest-first (GitHub default). We compare each adjacent
 * pair by date only (no time-of-day / timezone assumptions) so the check is
 * robust regardless of the committer's locale.
 */
const DORMANT_GAP_MS = 365.25 * 24 * 60 * 60 * 1000;

function detectRevival(
  repos: { committedDate: string }[][],
): boolean {
  for (const history of repos) {
    for (let i = 0; i < history.length - 1; i++) {
      const newer = new Date(history[i].committedDate).getTime();
      const older = new Date(history[i + 1].committedDate).getTime();
      if (Number.isNaN(newer) || Number.isNaN(older)) continue;
      if (newer - older >= DORMANT_GAP_MS) return true;
    }
  }
  return false;
}

/** How many repos to scan for revival, and how deep per repo. */
const REVIVAL_REPO_COUNT = 20;
const REVIVAL_HISTORY_DEPTH = 100;

/**
 * Combined GraphQL query: contribution calendar, merged-PR count (search) and
 * recent default-branch commit history for the most-updated repos.
 */
const EXTENDED_QUERY = `
  query ($login: String!, $mergedQuery: String!, $repoCount: Int!, $historyDepth: Int!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(
        first: $repoCount
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: $historyDepth) {
                  nodes { committedDate }
                }
              }
            }
          }
        }
      }
    }
    search(query: $mergedQuery, type: ISSUE, first: 0) {
      issueCount
    }
  }
`;

/**
 * Fetch extended stats via GraphQL. Requires a token; returns zeroed defaults
 * when no token is configured (GraphQL is auth-only).
 */
async function fetchContributions(username: string): Promise<{
  total: number;
  current: number;
  longest: number;
  mergedPullRequests: number;
  revivedDormantRepo: boolean;
}> {
  const empty = {
    total: 0,
    current: 0,
    longest: 0,
    mergedPullRequests: 0,
    revivedDormantRepo: false,
  };
  if (!process.env.GITHUB_TOKEN) return empty;

  const res = await fetch(GRAPHQL_API, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      query: EXTENDED_QUERY,
      variables: {
        login: username,
        mergedQuery: `type:pr author:${username} is:merged`,
        repoCount: REVIVAL_REPO_COUNT,
        historyDepth: REVIVAL_HISTORY_DEPTH,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 403 || res.status === 429) throw new GitHubRateLimitError();
    // Non-fatal: fall back to defaults rather than failing the whole card.
    return empty;
  }

  const json = await res.json();
  const parsed = extendedSchema.safeParse(json);
  if (!parsed.success || !parsed.data.data.user) return empty;

  const user = parsed.data.data.user;
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((w) => w.contributionDays);
  const { current, longest } = computeStreaks(days);

  const histories = user.repositories.nodes.map(
    (n) => n.defaultBranchRef?.target?.history?.nodes ?? [],
  );
  const revivedDormantRepo = detectRevival(histories);
  const mergedPullRequests = parsed.data.data.search?.issueCount ?? 0;

  return {
    total: calendar.totalContributions,
    current,
    longest,
    mergedPullRequests,
    revivedDormantRepo,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch and normalize public GitHub statistics for a user.
 *
 * @param rawUsername - GitHub handle (case-insensitive, trimmed).
 * @throws {GitHubUserNotFoundError} when the user does not exist (404).
 * @throws {GitHubRateLimitError} when rate-limited/forbidden (403/429).
 * @throws {GitHubApiError} on other unexpected upstream errors.
 */
export async function getGitHubStats(rawUsername: string): Promise<GitHubStats> {
  const username = rawUsername.trim();
  if (!username) throw new GitHubUserNotFoundError(rawUsername);

  const headers = buildHeaders();

  // 1) User profile (REST).
  const userRes = await fetch(
    `${REST_API}/users/${encodeURIComponent(username)}`,
    { headers, cache: "no-store" },
  );

  if (userRes.status === 404) throw new GitHubUserNotFoundError(username);
  if (!userRes.ok) throwForStatus(userRes.status, "fetch user");

  const user = userSchema.parse(await userRes.json());

  // 2) Repos (REST) — for stars + language breakdown. Sorted by pushed so the
  //    single page we scan reflects the most active repos.
  const reposRes = await fetch(
    `${REST_API}/users/${encodeURIComponent(username)}/repos?per_page=${REPO_SCAN_COUNT}&sort=pushed&type=owner`,
    { headers, cache: "no-store" },
  );

  let repos: z.infer<typeof repoListSchema> = [];
  if (reposRes.ok) {
    repos = repoListSchema.parse(await reposRes.json());
  } else if (reposRes.status === 403 || reposRes.status === 429) {
    throw new GitHubRateLimitError();
  }
  // Any other repo error → treat as empty profile (defaults below).

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const topLanguages = computeLanguageBreakdown(repos);

  // Compute top 3 repositories by stars (excluding forks)
  const topRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)
    .map((r) => ({ name: r.name, stars: r.stargazers_count }));

  // 3) Contributions + streaks (GraphQL, token-gated).
  const contributions = await fetchContributions(username);

  return {
    username: user.login,
    name: user.name?.trim() || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio ?? null,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    totalStars,
    topLanguages,
    contributionsLastYear: contributions.total,
    currentStreak: contributions.current,
    longestStreak: contributions.longest,
    createdAt: user.created_at,
    mergedPullRequests: contributions.mergedPullRequests,
    revivedDormantRepo: contributions.revivedDormantRepo,
    topRepos,
  };
}

/**
 * A small, curated set of GitHub language colors (hex). Not exhaustive — any
 * language not listed here renders with a neutral fallback in the UI.
 * Source: github/linguist.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Zig: "#ec915c",
};
