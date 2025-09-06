import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema/forum";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // Total uploaded
  const totalUploaded = await db
    .select()
    .from(documents)
    .where(eq(documents.uploaderId, userId.toString()));

  let accepted = 0;
  let rejected = 0;

  if (session.user.role === "admin" || session.user.role === "reviewer") {
    accepted = (
      await db
        .select()
        .from(documents)
        .where(and(eq(documents.uploaderId, userId.toString()), eq(documents.status, "approved")))
    ).length;

    rejected = (
      await db
        .select()
        .from(documents)
        .where(and(eq(documents.uploaderId, userId.toString()), eq(documents.status, "rejected")))
    ).length;
  }

  return NextResponse.json({
    totalUploaded: totalUploaded.length,
    accepted,
    rejected,
  });
}
