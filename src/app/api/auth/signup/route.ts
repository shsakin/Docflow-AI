import { NextResponse } from "next/server";
import { db } from "@/server/db"; // your drizzle db instance
import { users } from "@/server/db/schema/auth-users"; 
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Default role = uploader
    await db.insert(users).values({
      name,
      email,
      passwordHash: hashed,
      role: "uploader",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
