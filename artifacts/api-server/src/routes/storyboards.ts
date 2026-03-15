import { Router } from "express";
import { db } from "@workspace/db";
import { storyboardsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/storyboards", async (_req, res) => {
  const items = await db.select().from(storyboardsTable).orderBy(storyboardsTable.createdAt);
  res.json(items);
});

router.post("/storyboards", async (req, res) => {
  const { title, type, scenes } = req.body;
  const [item] = await db.insert(storyboardsTable).values({
    title, type: type || "storyboard", scenes: scenes || "[]",
  }).returning();
  res.status(201).json(item);
});

router.get("/storyboards/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(storyboardsTable).where(eq(storyboardsTable.id, id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.put("/storyboards/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
  const [item] = await db.update(storyboardsTable).set(updates).where(eq(storyboardsTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/storyboards/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(storyboardsTable).where(eq(storyboardsTable.id, id));
  res.status(204).send();
});

export default router;
