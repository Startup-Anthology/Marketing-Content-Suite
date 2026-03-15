import { Router } from "express";
import { db } from "@workspace/db";
import { brandGuideTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/brand-guide", async (_req, res) => {
  const items = await db.select().from(brandGuideTable).limit(1);
  if (items.length === 0) {
    res.json(null);
    return;
  }
  res.json(items[0]);
});

router.put("/brand-guide", async (req, res) => {
  const { brandName, voiceDescriptors, tone, colorPalette, fonts, logoUrl, tagline, brandStory } = req.body;
  const items = await db.select().from(brandGuideTable).limit(1);

  if (items.length === 0) {
    const [item] = await db.insert(brandGuideTable).values({
      brandName: brandName || "",
      voiceDescriptors: voiceDescriptors || "",
      tone: tone || "",
      colorPalette: colorPalette || "[]",
      fonts: fonts || "[]",
      logoUrl: logoUrl || "",
      tagline: tagline || "",
      brandStory: brandStory || "",
    }).returning();
    res.status(201).json(item);
  } else {
    const existing = items[0];
    const [item] = await db.update(brandGuideTable).set({
      brandName: brandName ?? existing.brandName,
      voiceDescriptors: voiceDescriptors ?? existing.voiceDescriptors,
      tone: tone ?? existing.tone,
      colorPalette: colorPalette ?? existing.colorPalette,
      fonts: fonts ?? existing.fonts,
      logoUrl: logoUrl ?? existing.logoUrl,
      tagline: tagline ?? existing.tagline,
      brandStory: brandStory ?? existing.brandStory,
      updatedAt: new Date(),
    }).where(eq(brandGuideTable.id, existing.id)).returning();
    res.json(item);
  }
});

export default router;
