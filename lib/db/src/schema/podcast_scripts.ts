import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const podcastScriptsTable = pgTable("podcast_scripts", {
  id: serial("id").primaryKey(),
  episodeTitle: text("episode_title").notNull(),
  topic: text("topic").notNull(),
  format: text("format").notNull(),
  targetLength: text("target_length").notNull(),
  script: text("script").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPodcastScriptSchema = createInsertSchema(podcastScriptsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPodcastScript = z.infer<typeof insertPodcastScriptSchema>;
export type PodcastScript = typeof podcastScriptsTable.$inferSelect;
