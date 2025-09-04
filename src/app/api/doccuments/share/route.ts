// app/api/documents/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema/forum";

export async function POST(req: NextRequest) {
  try {
    const { title, fileUrl, summary, uploaderId } = await req.json();

    if (!uploaderId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [doc] = await db
      .insert(documents)
      .values({
        title,
        fileUrl,
        summary,
        uploaderId,
        status: "pending", // always pending at first
      })
      .returning();

    return NextResponse.json({ success: true, document: doc });
  } catch (err) {
    console.error("❌ Share error:", err);
    return NextResponse.json({ error: "Failed to share" }, { status: 500 });
  }
}
