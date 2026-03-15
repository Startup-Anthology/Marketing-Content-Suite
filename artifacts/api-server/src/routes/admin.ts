import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/admin/users", authMiddleware, adminMiddleware, async (_req, res) => {
  const users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    displayName: usersTable.displayName,
    avatarUrl: usersTable.avatarUrl,
    role: usersTable.role,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  }).from(usersTable);
  res.json(users);
});

router.put("/admin/users/:id", authMiddleware, adminMiddleware, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { role, isActive } = req.body;

  if (id === req.user!.id && isActive === false) {
    res.status(400).json({ error: "You cannot deactivate your own account" });
    return;
  }

  if (id === req.user!.id && role && role !== "admin") {
    res.status(400).json({ error: "You cannot remove your own admin role" });
    return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (role !== undefined && ["admin", "editor", "viewer"].includes(role)) {
    updates.role = role;
  }
  if (isActive !== undefined) {
    updates.isActive = isActive;
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

export default router;
