import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { comments } from "@/server/db/schema/forum";

export async function POST(req: NextRequest) {
  try {
    const { documentId, userId, userName, content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Empty comment" }, { status: 400 });
    }
    if (!documentId || !userId || !userName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        documentId,
        userId,
        userName,
        content,
      })
      .returning();

    return NextResponse.json({ comment: newComment });
  } catch (err) {
    console.error("❌ Comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
