import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GitHubRepoPayload {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  owner: { login: string };
  license: { spdx_id?: string | null; name?: string | null } | null;
  stargazers_count: number;
  fork: boolean;
  private: boolean;
  updated_at: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as
    | { username?: string; name?: string; accessToken?: string }
    | undefined;
  const accessToken = sessionUser?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in via GitHub." },
      { status: 401 },
    );
  }

  const res = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevQuest",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to load GitHub repositories." },
      { status: res.status },
    );
  }

  const repos = (await res.json()) as GitHubRepoPayload[];
  return NextResponse.json({
    repos: repos.map((repo) => ({
      name: repo.name,
      owner: repo.owner.login,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description ?? "",
      license: repo.license?.spdx_id || repo.license?.name || "-",
      stars: repo.stargazers_count,
      fork: repo.fork,
      private: repo.private,
      updatedAt: repo.updated_at,
    })),
  });
}
