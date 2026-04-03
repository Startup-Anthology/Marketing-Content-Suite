import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const utmLinksTable = pgTable("utm_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  destinationUrl: text("destination_url").notNull(),
  source: text("source").notNull(),
  medium: text("medium").notNull(),
  campaign: text("campaign").notNull(),
  content: text("content"),
  term: text("term"),
  fullUrl: text("full_url").notNull(),
  shortCode: text("short_code").unique(),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUtmLinkSchema = createInsertSchema(utmLinksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUtmLink = z.infer<typeof insertUtmLinkSchema>;
export type UtmLink = typeof utmLinksTable.$inferSelect;
