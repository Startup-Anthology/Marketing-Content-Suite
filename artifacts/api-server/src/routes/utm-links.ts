import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { utmLinksTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const BRANDED_DOMAIN = "https://startupanthology.com";

function generateShortCode(): string {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

function buildFullUrl(destinationUrl: string, source: string, medium: string, campaign: string, content?: string, term?: string): string {
  const separator = destinationUrl.includes("?") ? "&" : "?";
  let url = `${destinationUrl}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
  if (content) url += `&utm_content=${encodeURIComponent(content)}`;
  if (term) url += `&utm_term=${encodeURIComponent(term)}`;
  return url;
}

function editorOrAdminCheck(role: string): boolean {
  return role === "admin" || role === "editor";
}

// List UTM links — admin sees all, editor/viewer sees own
router.get("/utm-links", authMiddleware, async (req, res) => {
  const user = req.user!;
  let items;
  if (user.role === "admin") {
    items = await db.select().from(utmLinksTable).orderBy(utmLinksTable.createdAt);
  } else {
    items = await db.select().from(utmLinksTable).where(eq(utmLinksTable.userId, user.id)).orderBy(utmLinksTable.createdAt);
  }
  res.json(items);
});

// Create UTM link with auto-generated short code
router.post("/utm-links", authMiddleware, async (req, res): Promise<void> => {
  if (!editorOrAdminCheck(req.user!.role)) {
    res.status(403).json({ error: "Editor or admin access required" });
    return;
  }

  const { destinationUrl, source, medium, campaign, content, term, notes } = req.body;

  if (!destinationUrl || !source || !medium || !campaign) {
    res.status(400).json({ error: "destinationUrl, source, medium, and campaign are required" });
    return;
  }

  const fullUrl = buildFullUrl(destinationUrl, source, medium, campaign, content, term);

  // Generate a unique short code with retry
  let shortCode: string | null = null;
  for (let i = 0; i < 5; i++) {
    const candidate = generateShortCode();
    const existing = await db.select({ id: utmLinksTable.id }).from(utmLinksTable).where(eq(utmLinksTable.shortCode, candidate));
    if (existing.length === 0) {
      shortCode = candidate;
      break;
    }
  }

  const [item] = await db.insert(utmLinksTable).values({
    userId: req.user!.id,
    destinationUrl,
    source: source.toLowerCase().trim(),
    medium: medium.toLowerCase().trim(),
    campaign: campaign.toLowerCase().trim(),
    content: content?.toLowerCase().trim() || null,
    term: term?.toLowerCase().trim() || null,
    fullUrl,
    shortCode,
    status: "active",
    notes: notes || null,
  }).returning();

  res.status(201).json({
    ...item,
    shortUrl: item.shortCode ? `${BRANDED_DOMAIN}/go/${item.shortCode}` : null,
  });
});

// Update UTM link
router.put("/utm-links/:id", authMiddleware, async (req, res): Promise<void> => {
  if (!editorOrAdminCheck(req.user!.role)) {
    res.status(403).json({ error: "Editor or admin access required" });
    return;
  }

  const id = Number(req.params.id);
  const user = req.user!;

  // Verify existence and ownership (admin can edit any)
  const conditions = user.role === "admin"
    ? eq(utmLinksTable.id, id)
    : and(eq(utmLinksTable.id, id), eq(utmLinksTable.userId, user.id));

  const [existing] = await db.select().from(utmLinksTable).where(conditions);
  if (!existing) {
    res.status(404).json({ error: "UTM link not found" });
    return;
  }

  const { destinationUrl, source, medium, campaign, content, term, status, notes } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (destinationUrl !== undefined) updates.destinationUrl = destinationUrl;
  if (source !== undefined) updates.source = source.toLowerCase().trim();
  if (medium !== undefined) updates.medium = medium.toLowerCase().trim();
  if (campaign !== undefined) updates.campaign = campaign.toLowerCase().trim();
  if (content !== undefined) updates.content = content?.toLowerCase().trim() || null;
  if (term !== undefined) updates.term = term?.toLowerCase().trim() || null;
  if (status !== undefined && ["active", "paused", "completed"].includes(status)) updates.status = status;
  if (notes !== undefined) updates.notes = notes || null;

  // Rebuild full URL if any UTM param changed
  const newDest = (updates.destinationUrl as string) || existing.destinationUrl;
  const newSource = (updates.source as string) || existing.source;
  const newMedium = (updates.medium as string) || existing.medium;
  const newCampaign = (updates.campaign as string) || existing.campaign;
  const newContent = updates.content !== undefined ? (updates.content as string | null) : existing.content;
  const newTerm = updates.term !== undefined ? (updates.term as string | null) : existing.term;
  updates.fullUrl = buildFullUrl(newDest, newSource, newMedium, newCampaign, newContent || undefined, newTerm || undefined);

  const [item] = await db.update(utmLinksTable).set(updates).where(eq(utmLinksTable.id, id)).returning();

  res.json({
    ...item,
    shortUrl: item.shortCode ? `${BRANDED_DOMAIN}/go/${item.shortCode}` : null,
  });
});

// Delete UTM link
router.delete("/utm-links/:id", authMiddleware, async (req, res): Promise<void> => {
  if (!editorOrAdminCheck(req.user!.role)) {
    res.status(403).json({ error: "Editor or admin access required" });
    return;
  }

  const id = Number(req.params.id);
  const user = req.user!;

  const conditions = user.role === "admin"
    ? eq(utmLinksTable.id, id)
    : and(eq(utmLinksTable.id, id), eq(utmLinksTable.userId, user.id));

  const [existing] = await db.select().from(utmLinksTable).where(conditions);
  if (!existing) {
    res.status(404).json({ error: "UTM link not found" });
    return;
  }

  await db.delete(utmLinksTable).where(eq(utmLinksTable.id, id));
  res.status(204).send();
});

// Public short URL redirect — no auth required
router.get("/go/:code", async (req, res): Promise<void> => {
  const code = req.params.code;
  const [link] = await db.select().from(utmLinksTable).where(eq(utmLinksTable.shortCode, code));

  if (!link) {
    res.status(404).json({ error: "Short link not found" });
    return;
  }

  res.redirect(302, link.fullUrl);
});

export default router;
