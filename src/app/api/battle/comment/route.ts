import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBattleDateId, addCommentProject } from "@/lib/battle";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as unknown as { username?: string; name?: string } | undefined;
  const username = sessionUser?.username ?? sessionUser?.name;

  if (!username) {
    return NextResponse.json({ error: "Unauthorized. Please sign in via GitHub." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, text } = body;

    if (!projectId || !text) {
      return NextResponse.json({ error: "Project ID and comment text are required." }, { status: 400 });
    }

    const todayId = getBattleDateId();
    const result = await addCommentProject(todayId, username, projectId, text);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to add comment. Project not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, comment: result.comment });
  } catch (e) {
    console.error("[api/battle/comment] Comment failed:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
