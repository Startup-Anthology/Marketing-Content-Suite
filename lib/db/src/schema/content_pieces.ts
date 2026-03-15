import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentPiecesTable = pgTable("content_pieces", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  platform: text("platform").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContentPieceSchema = createInsertSchema(contentPiecesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentPiece = z.infer<typeof insertContentPieceSchema>;
export type ContentPiece = typeof contentPiecesTable.$inferSelect;
