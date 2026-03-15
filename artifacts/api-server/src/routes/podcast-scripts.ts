import { Router } from "express";
import { db } from "@workspace/db";
import { podcastScriptsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/podcast-scripts", async (_req, res) => {
  const items = await db.select().from(podcastScriptsTable).orderBy(podcastScriptsTable.createdAt);
  res.json(items);
});

router.post("/podcast-scripts", async (req, res) => {
  const { episodeTitle, topic, format, targetLength, script, status } = req.body;
  const [item] = await db.insert(podcastScriptsTable).values({
    episodeTitle, topic, format, targetLength, script, status: status || "draft",
  }).returning();
  res.status(201).json(item);
});

router.get("/podcast-scripts/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(podcastScriptsTable).where(eq(podcastScriptsTable.id, id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/podcast-scripts/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(podcastScriptsTable).where(eq(podcastScriptsTable.id, id));
  res.status(204).send();
});

export default router;
