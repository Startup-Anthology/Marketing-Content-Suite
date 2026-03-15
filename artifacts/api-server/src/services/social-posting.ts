import { db } from "@workspace/db";
import { socialAccountsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export interface PlatformValidation {
  valid: boolean;
  errors: string[];
}

const PLATFORM_LIMITS: Record<string, { maxChars: number; name: string }> = {
  "LinkedIn": { maxChars: 3000, name: "LinkedIn" },
  "X/Twitter": { maxChars: 280, name: "X/Twitter" },
  "Instagram": { maxChars: 2200, name: "Instagram" },
  "TikTok": { maxChars: 2200, name: "TikTok" },
  "YouTube": { maxChars: 5000, name: "YouTube" },
};

export function validateContentForPlatform(platform: string, content: string): PlatformValidation {
  const errors: string[] = [];
  const limit = PLATFORM_LIMITS[platform];

  if (!content || content.trim().length === 0) {
    errors.push("Content cannot be empty");
    return { valid: false, errors };
  }

  if (limit && content.length > limit.maxChars) {
    errors.push(`${platform} posts cannot exceed ${limit.maxChars} characters (currently ${content.length})`);
  }

  if (platform === "Instagram" && !content.includes("#")) {
    // Warning, not an error
  }

  return { valid: errors.length === 0, errors };
}

export async function getSocialAccount(platform: string) {
  const [account] = await db
    .select()
    .from(socialAccountsTable)
    .where(
      and(
        eq(socialAccountsTable.platform, platform),
        eq(socialAccountsTable.status, "active")
      )
    );
  return account || null;
}

export async function getAllSocialAccounts() {
  return db.select().from(socialAccountsTable).where(eq(socialAccountsTable.status, "active"));
}

async function refreshTokenIfNeeded(account: typeof socialAccountsTable.$inferSelect) {
  if (!account.accessToken) return null;
  if (!account.tokenExpiresAt) return account.accessToken;

  const expiresAt = new Date(account.tokenExpiresAt).getTime();
  if (Date.now() < expiresAt - 60000) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    await db
      .update(socialAccountsTable)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(socialAccountsTable.id, account.id));
    return null;
  }

  try {
    const newToken = await refreshPlatformToken(account.platform, account.refreshToken);
    if (newToken) {
      await db
        .update(socialAccountsTable)
        .set({
          accessToken: newToken.accessToken,
          refreshToken: newToken.refreshToken || account.refreshToken,
          tokenExpiresAt: newToken.expiresAt ? new Date(newToken.expiresAt) : account.tokenExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(socialAccountsTable.id, account.id));
      return newToken.accessToken;
    }
  } catch (err) {
    console.error(`Token refresh failed for ${account.platform}:`, err);
    await db
      .update(socialAccountsTable)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(socialAccountsTable.id, account.id));
  }
  return null;
}

async function refreshPlatformToken(
  platform: string,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number } | null> {
  switch (platform) {
    case "LinkedIn": {
      const clientId = process.env.LINKEDIN_CLIENT_ID || "";
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
      const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    }
    case "X/Twitter":
    case "TikTok":
    case "YouTube":
    case "Instagram":
      return null;
    default:
      return null;
  }
}

export interface PublishResult {
  success: boolean;
  error?: string;
  platformPostId?: string;
}

export async function publishToplatform(platform: string, content: string): Promise<PublishResult> {
  const account = await getSocialAccount(platform);
  if (!account) {
    return { success: false, error: `No connected ${platform} account. Please connect your account in Settings.` };
  }

  const validation = validateContentForPlatform(platform, content);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join("; ") };
  }

  const accessToken = await refreshTokenIfNeeded(account);
  if (!accessToken) {
    return { success: false, error: `${platform} connection has expired. Please reconnect in Settings.` };
  }

  try {
    switch (platform) {
      case "LinkedIn":
        return await postToLinkedIn(accessToken, content, account.platformUserId);
      case "X/Twitter":
        return await postToTwitter(accessToken, content);
      case "Instagram":
        return await postToInstagram(accessToken, content, account.platformUserId);
      case "TikTok":
        return await postToTikTok(accessToken, content);
      case "YouTube":
        return await postToYouTube(accessToken, content);
      default:
        return { success: false, error: `Publishing to ${platform} is not supported yet.` };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Failed to publish to ${platform}:`, message);
    return { success: false, error: `Failed to publish to ${platform}: ${message}` };
  }
}

async function postToLinkedIn(accessToken: string, content: string, userId?: string | null): Promise<PublishResult> {
  if (!userId) {
    return { success: false, error: "LinkedIn user ID not found. Please reconnect your account." };
  }

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `LinkedIn API error: ${err}` };
  }

  const data = await res.json();
  return { success: true, platformPostId: data.id };
}

async function postToTwitter(accessToken: string, content: string): Promise<PublishResult> {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: content }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Twitter API error: ${err}` };
  }

  const data = await res.json();
  return { success: true, platformPostId: data.data?.id };
}

async function postToInstagram(accessToken: string, content: string, userId?: string | null): Promise<PublishResult> {
  if (!userId) {
    return { success: false, error: "Instagram user ID not found. Please reconnect your account." };
  }

  return { success: false, error: "Instagram text-only posts are not supported via the API. Media is required." };
}

async function postToTikTok(accessToken: string, content: string): Promise<PublishResult> {
  return { success: false, error: "TikTok requires video content for posting. Text-only posts are not supported." };
}

async function postToYouTube(accessToken: string, content: string): Promise<PublishResult> {
  return { success: false, error: "YouTube requires video content for posting. Use this to schedule video descriptions and titles." };
}

export async function disconnectSocialAccount(platform: string): Promise<boolean> {
  const result = await db
    .update(socialAccountsTable)
    .set({ status: "disconnected", updatedAt: new Date() })
    .where(
      and(
        eq(socialAccountsTable.platform, platform),
        eq(socialAccountsTable.status, "active")
      )
    )
    .returning();
  return result.length > 0;
}
