// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";                    // your Drizzle client
import { users } from "@/server/db/schema/auth-users";          // your users table schema
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        // Find user by email
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user[0]) {
          return null;
        }

        // Compare hashed password
        const isValid = await bcrypt.compare(credentials.password, user[0].passwordHash ?? "");
        if (!isValid) {
          return null;
        }

        // Return user object for session
        return {
          id: user[0].id.toString(),
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
          avatarUrl: user[0].avatarUrl,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // your custom sign-in page route
  },
  session: {
    strategy: "jwt", // JWT-based session
  },
  callbacks: {
    async jwt({ token, user }) {
      // Runs when user logs in
      if (user) {
        token.id = user.id;
        token.role = user.role; // attach id to JWT
      }
      return token;
    },
    async session({ session, token }) {
      // Attach user.id to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;  // 👈 add id here
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
