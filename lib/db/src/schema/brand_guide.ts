import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const brandGuideTable = pgTable("brand_guide", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull().default(""),
  voiceDescriptors: text("voice_descriptors").notNull().default(""),
  tone: text("tone").notNull().default(""),
  colorPalette: text("color_palette").notNull().default("[]"),
  fonts: text("fonts").notNull().default("[]"),
  logoUrl: text("logo_url").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  brandStory: text("brand_story").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBrandGuideSchema = createInsertSchema(brandGuideTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBrandGuide = z.infer<typeof insertBrandGuideSchema>;
export type BrandGuide = typeof brandGuideTable.$inferSelect;
