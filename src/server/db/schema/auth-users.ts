import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),                // Auto-increment user ID
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),          // For password-based login
  avatarUrl: text("avatar_url"),                // Optional profile picture
  role: varchar("role", { length: 50 }).default("user"), // user/admin
  provider: varchar("provider", { length: 50 }), // For OAuth providers (Google, GitHub)
  providerId: varchar("provider_id", { length: 255 }), // Provider unique ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
