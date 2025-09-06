import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { documents, comments } from "@/server/db/schema/forum";
import { eq } from "drizzle-orm";

export async function GET() {
  const docs = await db.select().from(documents).orderBy(documents.createdAt);

  // attach comments for each doc
  const docsWithComments = await Promise.all(
    docs.map(async (doc) => {
      const docComments = await db
        .select()
        .from(comments)
        .where(eq(comments.documentId, doc.id));
      return { ...doc, comments: docComments };
    })
  );

  return NextResponse.json({ feed: docsWithComments});
}
