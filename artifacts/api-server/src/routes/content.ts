import { Router } from "express";
import { db } from "@workspace/db";
import { contentPiecesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/content", async (_req, res) => {
  const items = await db.select().from(contentPiecesTable).orderBy(contentPiecesTable.createdAt);
  res.json(items);
});

router.post("/content", async (req, res) => {
  const { type, platform, title, body, status } = req.body;
  const [item] = await db.insert(contentPiecesTable).values({
    type, platform, title, body, status: status || "draft",
  }).returning();
  res.status(201).json(item);
});

router.get("/content/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(contentPiecesTable).where(eq(contentPiecesTable.id, id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.put("/content/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
  const [item] = await db.update(contentPiecesTable).set(updates).where(eq(contentPiecesTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/content/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(contentPiecesTable).where(eq(contentPiecesTable.id, id));
  res.status(204).send();
});

export default router;
