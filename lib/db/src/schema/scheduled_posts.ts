import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduledPostsTable = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertScheduledPostSchema = createInsertSchema(scheduledPostsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;
export type ScheduledPost = typeof scheduledPostsTable.$inferSelect;
