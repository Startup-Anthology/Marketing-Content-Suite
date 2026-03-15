import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, signToken } from "../middleware/auth";

const router = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const allUsers = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  const isFirstUser = allUsers.length === 0;

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase().trim(),
    passwordHash,
    displayName: displayName || "",
    role: isFirstUser ? "admin" : "viewer",
  }).returning();

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      preferences: user.preferences,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Your account has been deactivated" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      preferences: user.preferences,
    },
  });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    preferences: user.preferences,
  });
});

router.put("/auth/profile", authMiddleware, async (req, res): Promise<void> => {
  const { displayName, email, avatarUrl, preferences } = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (displayName !== undefined) updates.displayName = displayName;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (preferences !== undefined) updates.preferences = typeof preferences === "string" ? preferences : JSON.stringify(preferences);

  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));
    if (existing.length > 0 && existing[0].id !== req.user!.id) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    updates.email = normalizedEmail;
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.user!.id)).returning();

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    preferences: user.preferences,
  });
});

export default router;
