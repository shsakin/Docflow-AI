// app/api/documents/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema/forum";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { docId, status, role } = await req.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!["admin", "reviewer"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.update(documents)
    .set({ status })
    .where(eq(documents.id, docId));

  return NextResponse.json({ success: true });
}
