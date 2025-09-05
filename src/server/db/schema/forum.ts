import { pgTable, serial, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "@/server/db/schema/auth-users";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  uploaderId: varchar("uploader_id", { length: 255 }).references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending | approved | rejected
  summary: text("summary"), // AI generated summary
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
