import { Router } from "express";
import { db } from "@workspace/db";
import { socialAccountsTable, scheduledPostsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import {
  getAuthUrl,
  isPlatformConfigured,
  exchangeCode,
  saveTokens,
  getPlatformFromKey,
  validateAndConsumeState,
} from "../services/social-oauth";
import {
  getSocialAccount,
  getAllSocialAccounts,
  disconnectSocialAccount,
  validateContentForPlatform,
  publishToplatform,
} from "../services/social-posting";

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

router.get("/social-accounts/oauth/list", async (_req, res) => {
  try {
    const accounts = await getAllSocialAccounts();
    const safeAccounts = accounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      platformUsername: a.platformUsername,
      status: a.status,
      createdAt: a.createdAt,
    }));
    res.json(safeAccounts);
  } catch (err) {
    console.error("Failed to fetch social accounts:", err);
    res.status(500).json({ error: "Failed to fetch social accounts" });
  }
});

router.get("/social-accounts/status/:platform", async (req, res) => {
  try {
    const platform = req.params.platform;
    const account = await getSocialAccount(platform);
    const configured = isPlatformConfigured(platform);
    res.json({
      connected: !!account,
      configured,
      username: account?.platformUsername || null,
    });
  } catch (err) {
    console.error("Failed to fetch platform status:", err);
    res.status(500).json({ error: "Failed to fetch platform status" });
  }
});

router.get("/social-accounts/auth-url/:platformKey", (req, res): void => {
  const platformKey = req.params.platformKey;
  const platform = getPlatformFromKey(platformKey);
  if (!platform) {
    res.status(400).json({ error: "Unsupported platform" });
    return;
  }

  if (!isPlatformConfigured(platform)) {
    res.status(400).json({ error: `${platform} OAuth is not configured. Set the required environment variables.` });
    return;
  }

  const result = getAuthUrl(platform);
  if (!result) {
    res.status(500).json({ error: "Could not generate authorization URL" });
    return;
  }

  res.json({ url: result.url });
});

const CALLBACK_PLATFORMS = ["linkedin", "twitter", "instagram", "tiktok", "youtube"];

for (const key of CALLBACK_PLATFORMS) {
  router.get(`/social-accounts/callback/${key}`, async (req, res): Promise<void> => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!state) {
      res.status(400).send(renderCallbackPage(false, "Missing state parameter. Please try again."));
      return;
    }

    const stateData = validateAndConsumeState(state);
    if (!stateData) {
      res.status(400).send(renderCallbackPage(false, "Invalid or expired authorization state. Please try connecting again."));
      return;
    }

    const platform = stateData.platform;

    if (!code) {
      res.status(400).send(renderCallbackPage(false, "Missing authorization code."));
      return;
    }

    try {
      const tokens = await exchangeCode(platform, code, stateData.codeVerifier);
      await saveTokens(platform, tokens);
      res.send(renderCallbackPage(true, `${escapeHtml(platform)} connected successfully!`));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`OAuth callback error for ${platform}:`, message);
      res.status(500).send(renderCallbackPage(false, "Connection failed. Please try again."));
    }
  });
}

router.post("/social-accounts/disconnect/:platform", async (req, res) => {
  try {
    const platform = req.params.platform;
    const success = await disconnectSocialAccount(platform);
    res.json({ success, connected: false });
  } catch (err) {
    console.error("Failed to disconnect social account:", err);
    res.status(500).json({ error: "Failed to disconnect account" });
  }
});

router.post("/social-accounts/validate", async (req, res): Promise<void> => {
  const { platform, content } = req.body;
  if (!platform || !content) {
    res.status(400).json({ error: "Platform and content are required" });
    return;
  }
  const result = validateContentForPlatform(platform, content);
  res.json(result);
});

router.post("/social-accounts/publish", async (req, res): Promise<void> => {
  const { platform, content, postId } = req.body;
  if (!platform || !content) {
    res.status(400).json({ error: "Platform and content are required" });
    return;
  }

  try {
    const result = await publishToplatform(platform, content);

    if (result.success && postId) {
      try {
        await db
          .update(scheduledPostsTable)
          .set({
            status: "published",
            updatedAt: new Date(),
          })
          .where(eq(scheduledPostsTable.id, Number(postId)));
      } catch (err) {
        console.error("Failed to update post status after publish:", err);
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Publish error:", err);
    res.status(500).json({ success: false, error: "An unexpected error occurred while publishing." });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCallbackPage(success: boolean, message: string): string {
  const color = success ? "#22C55E" : "#EF4444";
  const icon = success ? "&#10003;" : "&#10007;";
  return `
    <html>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,-apple-system,sans-serif;background:#000;color:#fff;">
        <div style="text-align:center;max-width:400px;padding:40px;">
          <div style="font-size:48px;color:${color};margin-bottom:16px;">${icon}</div>
          <h2 style="color:${color};margin-bottom:8px;">${success ? "Connected!" : "Connection Failed"}</h2>
          <p style="color:#94A3B8;font-size:14px;">${escapeHtml(message)}</p>
          <p style="color:#64748B;font-size:12px;margin-top:24px;">You can close this window and return to the app.</p>
        </div>
      </body>
    </html>
  `;
}

export default router;
