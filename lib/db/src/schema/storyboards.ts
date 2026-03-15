import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storyboardsTable = pgTable("storyboards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("storyboard"),
  scenes: text("scenes").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStoryboardSchema = createInsertSchema(storyboardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStoryboard = z.infer<typeof insertStoryboardSchema>;
export type Storyboard = typeof storyboardsTable.$inferSelect;
