import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBattleDateId, getBattleProjects, submitProject } from "@/lib/battle";

export async function GET() {
  const todayId = getBattleDateId();
  const yesterdayId = getBattleDateId(24 * 60 * 60 * 1000);

  const [todayProjects, yesterdayProjects] = await Promise.all([
    getBattleProjects(todayId),
    getBattleProjects(yesterdayId),
  ]);

  const sortedToday = [...todayProjects].sort((a, b) => b.votes.length - a.votes.length);
  const sortedYesterday = [...yesterdayProjects].sort((a, b) => b.votes.length - a.votes.length);

  return NextResponse.json({
    todayId,
    yesterdayId,
    todayProjects: sortedToday,
    yesterdayProjects: sortedYesterday,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as unknown as { username?: string; name?: string; accessToken?: string } | undefined;
  const username = sessionUser?.username ?? sessionUser?.name;
  const accessToken = sessionUser?.accessToken;

  if (!username) {
    return NextResponse.json({ error: "Unauthorized. Please sign in via GitHub." }, { status: 401 });
  }

  // Mandatory star check on https://github.com/yiaany/devquest
  if (!accessToken) {
    return NextResponse.json({ error: "GitHub access token missing. Please sign out and sign in again." }, { status: 401 });
  }

  try {
    const starRes = await fetch("https://api.github.com/user/starred/yiaany/devquest", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevQuest",
      },
      cache: "no-store",
    });

    if (starRes.status !== 204) {
      return NextResponse.json(
        { error: "To submit, you must first star our repository: https://github.com/yiaany/devquest" },
        { status: 403 }
      );
    }
  } catch (e) {
    console.error("[api/battle] Star check failed:", e);
    return NextResponse.json({ error: "Failed to verify yiaany/devquest star status." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      repoOwner,
      repoName,
      name,
      tagline,
      description,
      keywords,
      alternativeLinks,
      license,
      thumbnail,
      screenshots,
      videoLink,
      makers,
    } = body;

    // Validation
    if (!repoOwner || !repoName) {
      return NextResponse.json({ error: "GitHub repository owner and name are required." }, { status: 400 });
    }
    if (!name || !tagline || !description || !thumbnail) {
      return NextResponse.json({ error: "Name, tagline, description, and thumbnail are required." }, { status: 400 });
    }
    if (tagline.length > 60) {
      return NextResponse.json({ error: "Tagline must be under 60 characters." }, { status: 400 });
    }
    if (description.length > 260) {
      return NextResponse.json({ error: "Description must be under 260 characters." }, { status: 400 });
    }
    if (!Array.isArray(screenshots) || screenshots.length < 2) {
      return NextResponse.json({ error: "Please upload at least 2 screenshots." }, { status: 400 });
    }

    const computedPrimaryLink = `https://github.com/${repoOwner}/${repoName}`;

    // Verify repository exists on GitHub
    const githubRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "DevQuest",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (githubRes.status === 404) {
      return NextResponse.json({ error: "GitHub repository not found." }, { status: 404 });
    }

    if (!githubRes.ok) {
      return NextResponse.json({ error: "Failed to verify repository on GitHub." }, { status: 500 });
    }

    const todayId = getBattleDateId();
    const result = await submitProject(todayId, username, repoOwner, repoName, {
      name,
      tagline,
      description,
      keywords: keywords || [],
      primaryLink: computedPrimaryLink,
      alternativeLinks: alternativeLinks || [],
      license: license || "-",
      thumbnail,
      screenshots,
      videoLink,
      makers: makers || [],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/battle] Submit failed:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
