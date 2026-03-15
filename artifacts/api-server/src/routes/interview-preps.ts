import { Router } from "express";
import { db } from "@workspace/db";
import { interviewPrepsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/interview-preps", async (_req, res) => {
  const items = await db.select().from(interviewPrepsTable).orderBy(interviewPrepsTable.createdAt);
  res.json(items);
});

router.post("/interview-preps", async (req, res) => {
  const { guestName, guestBio, interviewTopic, episodeLength, content, status } = req.body;
  const [item] = await db.insert(interviewPrepsTable).values({
    guestName, guestBio, interviewTopic, episodeLength, content, status: status || "draft",
  }).returning();
  res.status(201).json(item);
});

router.get("/interview-preps/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(interviewPrepsTable).where(eq(interviewPrepsTable.id, id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/interview-preps/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(interviewPrepsTable).where(eq(interviewPrepsTable.id, id));
  res.status(204).send();
});

export default router;
