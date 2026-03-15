import { Router } from "express";
import { db } from "@workspace/db";
import { socialAccountsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/social-accounts", authMiddleware, async (req, res) => {
  const items = await db.select().from(socialAccountsTable).where(eq(socialAccountsTable.userId, req.user!.id));
  res.json(items);
});

router.post("/social-accounts", authMiddleware, async (req, res): Promise<void> => {
  const { platform, username, profileUrl } = req.body;

  if (!platform) {
    res.status(400).json({ error: "Platform is required" });
    return;
  }

  const existing = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.userId, req.user!.id), eq(socialAccountsTable.platform, platform))
  );

  if (existing.length > 0) {
    const [item] = await db.update(socialAccountsTable).set({
      username: username || "",
      profileUrl: profileUrl || "",
      isConnected: true,
      updatedAt: new Date(),
    }).where(eq(socialAccountsTable.id, existing[0].id)).returning();
    res.json(item);
    return;
  }

  const [item] = await db.insert(socialAccountsTable).values({
    userId: req.user!.id,
    platform,
    username: username || "",
    profileUrl: profileUrl || "",
    isConnected: true,
  }).returning();
  res.status(201).json(item);
});

router.put("/social-accounts/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { username, profileUrl, isConnected } = req.body;

  const [existing] = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, req.user!.id))
  );

  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (username !== undefined) updates.username = username;
  if (profileUrl !== undefined) updates.profileUrl = profileUrl;
  if (isConnected !== undefined) updates.isConnected = isConnected;

  const [item] = await db.update(socialAccountsTable).set(updates).where(eq(socialAccountsTable.id, id)).returning();
  res.json(item);
});

router.delete("/social-accounts/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = Number(req.params.id);

  const [existing] = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, req.user!.id))
  );

  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db.delete(socialAccountsTable).where(eq(socialAccountsTable.id, id));
  res.status(204).send();
});

export default router;
