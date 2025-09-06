import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema/forum";
import { users } from "@/server/db/schema/auth-users"; // 👈 make sure this exists
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchName = searchParams.get("name");

    // 🔹 If searching for another user
    if (searchName) {
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.name, searchName))
        .limit(1);

      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const totalUploaded = await db
        .select()
        .from(documents)
        .where(eq(documents.uploaderId, targetUser.id.toString()));

      let accepted = 0;
      let rejected = 0;

      if (targetUser.role === "admin" || targetUser.role === "reviewer") {
        accepted = (
          await db
            .select()
            .from(documents)
            .where(
              and(
                eq(documents.uploaderId, targetUser.id.toString()),
                eq(documents.status, "approved")
              )
            )
        ).length;

        rejected = (
          await db
            .select()
            .from(documents)
            .where(
              and(
                eq(documents.uploaderId, targetUser.id.toString()),
                eq(documents.status, "rejected")
              )
            )
        ).length;
      }

      return NextResponse.json({
        user: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
        stats: {
          totalUploaded: totalUploaded.length,
          accepted,
          rejected,
        },
      });
    }

    // 🔹 Otherwise: current logged-in user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

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
          .where(
            and(
              eq(documents.uploaderId, userId.toString()),
              eq(documents.status, "approved")
            )
          )
      ).length;

      rejected = (
        await db
          .select()
          .from(documents)
          .where(
            and(
              eq(documents.uploaderId, userId.toString()),
              eq(documents.status, "rejected")
            )
          )
      ).length;
    }

    return NextResponse.json({
      user: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      stats: {
        totalUploaded: totalUploaded.length,
        accepted,
        rejected,
      },
    });
  } catch (err) {
    console.error("❌ Profile API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
