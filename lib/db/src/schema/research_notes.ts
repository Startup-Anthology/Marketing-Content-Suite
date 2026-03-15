import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const researchNotesTable = pgTable("research_notes", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResearchNoteSchema = createInsertSchema(researchNotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResearchNote = z.infer<typeof insertResearchNoteSchema>;
export type ResearchNote = typeof researchNotesTable.$inferSelect;
