import { Router } from "express";
import { db } from "@workspace/db";
import { scheduledPostsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/scheduled-posts", async (_req, res) => {
  const items = await db.select().from(scheduledPostsTable).orderBy(scheduledPostsTable.scheduledAt);
  res.json(items);
});

router.post("/scheduled-posts", async (req, res) => {
  const { platform, content, scheduledAt, status } = req.body;
  const [item] = await db.insert(scheduledPostsTable).values({
    platform, content, scheduledAt: new Date(scheduledAt), status: status || "draft",
  }).returning();
  res.status(201).json(item);
});

router.get("/scheduled-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(scheduledPostsTable).where(eq(scheduledPostsTable.id, id));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.put("/scheduled-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { platform, content, scheduledAt, status } = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (platform !== undefined) updates.platform = platform;
  if (content !== undefined) updates.content = content;
  if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
  if (status !== undefined) updates.status = status;
  const [item] = await db.update(scheduledPostsTable).set(updates).where(eq(scheduledPostsTable.id, id)).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/scheduled-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(scheduledPostsTable).where(eq(scheduledPostsTable.id, id));
  res.status(204).send();
});

export default router;
