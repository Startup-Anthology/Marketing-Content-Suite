import { Router } from "express";
import { db } from "@workspace/db";
import { researchNotesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/research-notes", async (_req, res) => {
  const items = await db.select().from(researchNotesTable).orderBy(researchNotesTable.createdAt);
  res.json(items);
});

router.post("/research-notes", async (req, res) => {
  const { category, topic, content } = req.body;
  const [item] = await db.insert(researchNotesTable).values({
    category, topic, content,
  }).returning();
  res.status(201).json(item);
});

router.get("/research-notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(researchNotesTable).where(eq(researchNotesTable.id, id));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.put("/research-notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
  const [item] = await db.update(researchNotesTable).set(updates).where(eq(researchNotesTable.id, id)).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/research-notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(researchNotesTable).where(eq(researchNotesTable.id, id));
  res.status(204).send();
});

export default router;
