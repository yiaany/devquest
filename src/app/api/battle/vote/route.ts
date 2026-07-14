import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBattleDateId, toggleVoteProject } from "@/lib/battle";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as unknown as { username?: string; name?: string } | undefined;
  const username = sessionUser?.username ?? sessionUser?.name;

  if (!username) {
    return NextResponse.json({ error: "Unauthorized. Please sign in via GitHub." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const todayId = getBattleDateId();
    const result = await toggleVoteProject(todayId, username, projectId);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to vote. Project not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("[api/battle/vote] Vote failed:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
