import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),               
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),          
  avatarUrl: text("avatar_url"),                
  role: varchar("role", { length: 50 }).default("user"), 
  provider: varchar("provider", { length: 50 }), 
  providerId: varchar("provider_id", { length: 255 }), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
