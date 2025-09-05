import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { documents, comments } from "@/server/db/schema/forum";
import { desc, eq } from "drizzle-orm";
import { users } from "@/server/db/schema/auth-users"; 

export async function GET() {
  try {
    // Fetch all documents
    const allDocs = await db.select().from(documents);
    const totalDocs = allDocs.length;
    const approved = allDocs.filter((d) => d.status === "approved").length;
    const rejected = allDocs.filter((d) => d.status === "rejected").length;
    const pending = allDocs.filter((d) => d.status === "pending").length;

    // Recent docs
    const recentDocs = await db
      .select({
        docTitle: documents.title,
        action: documents.status,
        userId: documents.uploaderId,
      })
      .from(documents)
      .orderBy(desc(documents.id))
      .limit(5);

    // Recent comments
    const recentComms = await db
      .select({
        docId: comments.documentId,
        content: comments.content,
        userId: comments.userId,
      })
      .from(comments)
      .orderBy(desc(comments.id))
      .limit(5);

    const activity: {
      user: string;
      action: string;
      doc: string;
      date: string;
    }[] = [];

    for (const r of recentDocs) {
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, Number(r.userId)));
      activity.push({
        user: user?.name || "Unknown",
        action: "uploaded",
        doc: r.docTitle,
        date: new Date().toISOString().split("T")[0],
      });
    }

    for (const c of recentComms) {
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, Number(c.userId)));

      const [doc] = await db
        .select({ title: documents.title })
        .from(documents)
        .where(eq(documents.id, c.docId));

      activity.push({
        user: user?.name || "Unknown",
        action: "commented",
        doc: doc?.title || "Unknown document",
        date: new Date().toISOString().split("T")[0],
      });
    }

    activity.sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json({
      totalDocs,
      approved,
      rejected,
      pending,
      recentActivity: activity.slice(0, 8),
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
