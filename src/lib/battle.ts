import { Redis } from "@upstash/redis";

export interface BattleComment {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface BattleProject {
  id: string; // "owner/repo"
  repoOwner: string;
  repoName: string;
  submittedBy: string; // Hunter
  name: string; // Name of the product
  tagline: string; // Short tagline (max 60 chars)
  description: string; // Detailed description (max 260 chars)
  keywords: string[]; // up to 3 keywords
  primaryLink: string;
  alternativeLinks: string[];
  license: string; // License under which the project is hosted (or "-" if none)
  thumbnail: string; // Logo image URL (GIF/PNG)
  screenshots: string[]; // At least 2-3 screenshots
  videoLink?: string; // Optional YouTube video link
  makers: string[]; // GitHub usernames of co-authors
  votes: string[]; // usernames of voters
  comments: BattleComment[];
  createdAt: number;
}

// In-memory fallback for local development
const memoryBattleStore = new Map<string, BattleProject[]>();

function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const creds = redisCredentials();
  if (creds) {
    redisClient = new Redis({ url: creds.url, token: creds.token });
    return redisClient;
  }
  return null;
}

/**
 * Calculates the battle date ID based on Yekaterinburg time (UTC+5).
 * Battle starts at 12:00 YeKT, which is 07:00 UTC.
 */
export function getBattleDateId(timeOffsetMs = 0): string {
  const targetTime = Date.now() - 7 * 60 * 60 * 1000 - timeOffsetMs;
  const d = new Date(targetTime);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getBattleProjects(battleId: string): Promise<BattleProject[]> {
  const redis = getRedis();
  const key = `devquest:battle:${battleId}`;
  if (redis) {
    try {
      const data = await redis.get<BattleProject[]>(key);
      return data ?? [];
    } catch (e) {
      console.error("[battle] Failed to get battle projects from Redis:", e);
      return [];
    }
  } else {
    return memoryBattleStore.get(key) ?? [];
  }
}

export async function saveBattleProjects(battleId: string, projects: BattleProject[]): Promise<void> {
  const redis = getRedis();
  const key = `devquest:battle:${battleId}`;
  if (redis) {
    try {
      await redis.set(key, projects, { ex: 7 * 24 * 60 * 60 });
    } catch (e) {
      console.error("[battle] Failed to save battle projects to Redis:", e);
    }
  } else {
    memoryBattleStore.set(key, projects);
  }
}

export async function submitProject(
  battleId: string,
  username: string,
  repoOwner: string,
  repoName: string,
  projectDetails: Omit<BattleProject, "id" | "repoOwner" | "repoName" | "submittedBy" | "votes" | "comments" | "createdAt">,
): Promise<{ success: boolean; error?: string }> {
  const projects = await getBattleProjects(battleId);
  const id = `${repoOwner}/${repoName}`.toLowerCase();

  if (projects.some((p) => p.id === id)) {
    return { success: false, error: "This repository is already submitted for today's battle." };
  }

  if (projects.some((p) => p.submittedBy.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: "You can only submit one repository per battle day." };
  }

  const newProject: BattleProject = {
    id,
    repoOwner,
    repoName,
    submittedBy: username,
    name: projectDetails.name.trim(),
    tagline: projectDetails.tagline.trim().slice(0, 60),
    description: projectDetails.description.trim().slice(0, 260),
    keywords: projectDetails.keywords.slice(0, 3),
    primaryLink: projectDetails.primaryLink.trim(),
    alternativeLinks: projectDetails.alternativeLinks,
    license: projectDetails.license.trim() || "-",
    thumbnail: projectDetails.thumbnail.trim(),
    screenshots: projectDetails.screenshots.slice(0, 5),
    videoLink: projectDetails.videoLink?.trim(),
    makers: Array.from(new Set([username, ...projectDetails.makers])),
    votes: [username], // Submitters auto-upvote
    comments: [],
    createdAt: Date.now(),
  };

  projects.push(newProject);
  await saveBattleProjects(battleId, projects);
  return { success: true };
}

export async function toggleVoteProject(
  battleId: string,
  username: string,
  projectId: string,
): Promise<{ success: boolean; votesCount: number; hasVoted: boolean }> {
  const projects = await getBattleProjects(battleId);
  const project = projects.find((p) => p.id === projectId.toLowerCase());
  if (!project) {
    return { success: false, votesCount: 0, hasVoted: false };
  }

  const voterIndex = project.votes.findIndex((v) => v.toLowerCase() === username.toLowerCase());
  let hasVoted = false;

  if (voterIndex > -1) {
    project.votes.splice(voterIndex, 1);
    hasVoted = false;
  } else {
    project.votes.push(username);
    hasVoted = true;
  }

  await saveBattleProjects(battleId, projects);
  return { success: true, votesCount: project.votes.length, hasVoted };
}

export async function addCommentProject(
  battleId: string,
  username: string,
  projectId: string,
  text: string,
): Promise<{ success: boolean; comment?: BattleComment }> {
  if (!text.trim()) return { success: false };

  const projects = await getBattleProjects(battleId);
  const project = projects.find((p) => p.id === projectId.toLowerCase());
  if (!project) {
    return { success: false };
  }

  const newComment: BattleComment = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    author: username,
    text: text.trim().slice(0, 300),
    createdAt: Date.now(),
  };

  project.comments.push(newComment);
  await saveBattleProjects(battleId, projects);
  return { success: true, comment: newComment };
}
