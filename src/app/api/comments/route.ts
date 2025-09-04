// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { comments } from "@/server/db/schema/forum";

export async function POST(req: NextRequest) {
  const { documentId, userId, userName, content } = await req.json();

  if (!content) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

  const [newComment] = await db
    .insert(comments)
    .values({ documentId, userId, userName, content })
    .returning();

  return NextResponse.json({ comment: newComment });
}
