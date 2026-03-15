import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const interviewPrepsTable = pgTable("interview_preps", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  guestBio: text("guest_bio").notNull(),
  interviewTopic: text("interview_topic").notNull(),
  episodeLength: text("episode_length").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInterviewPrepSchema = createInsertSchema(interviewPrepsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInterviewPrep = z.infer<typeof insertInterviewPrepSchema>;
export type InterviewPrep = typeof interviewPrepsTable.$inferSelect;
