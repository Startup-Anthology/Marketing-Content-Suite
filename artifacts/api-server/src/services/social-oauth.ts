import { db } from "@workspace/db";
import { socialAccountsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function getRedirectBase(): string {
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "http://localhost:3000/api";
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectPath: string;
}

const pendingOAuthStates = new Map<string, { platform: string; codeVerifier?: string; expiresAt: number }>();

function generateState(platform: string, codeVerifier?: string): string {
  const state = crypto.randomBytes(32).toString("hex");
  pendingOAuthStates.set(state, {
    platform,
    codeVerifier,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return state;
}

export function validateAndConsumeState(state: string): { platform: string; codeVerifier?: string } | null {
  const entry = pendingOAuthStates.get(state);
  if (!entry) return null;
  pendingOAuthStates.delete(state);
  if (Date.now() > entry.expiresAt) return null;
  return { platform: entry.platform, codeVerifier: entry.codeVerifier };
}

function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of pendingOAuthStates) {
    if (now > entry.expiresAt) pendingOAuthStates.delete(key);
  }
}, 5 * 60 * 1000);

const PLATFORM_CONFIGS: Record<string, () => OAuthConfig> = {
  LinkedIn: () => ({
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "w_member_social"],
    redirectPath: "/social-accounts/callback/linkedin",
  }),
  "X/Twitter": () => ({
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    redirectPath: "/social-accounts/callback/twitter",
  }),
  Instagram: () => ({
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["user_profile", "user_media"],
    redirectPath: "/social-accounts/callback/instagram",
  }),
  TikTok: () => ({
    clientId: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "video.publish"],
    redirectPath: "/social-accounts/callback/tiktok",
  }),
  YouTube: () => ({
    clientId: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"],
    redirectPath: "/social-accounts/callback/youtube",
  }),
};

const PLATFORM_KEY_MAP: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X/Twitter",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export function getPlatformFromKey(key: string): string | null {
  return PLATFORM_KEY_MAP[key] || null;
}

export function getKeyFromPlatform(platform: string): string {
  const entry = Object.entries(PLATFORM_KEY_MAP).find(([, v]) => v === platform);
  return entry ? entry[0] : platform.toLowerCase();
}

export function getAuthUrl(platform: string): { url: string; state: string } | null {
  const configFn = PLATFORM_CONFIGS[platform];
  if (!configFn) return null;

  const config = configFn();
  if (!config.clientId) return null;

  const redirectUri = `${getRedirectBase()}${config.redirectPath}`;

  let codeVerifier: string | undefined;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
  });

  if (platform === "X/Twitter") {
    const pkce = generatePKCE();
    codeVerifier = pkce.codeVerifier;
    params.set("code_challenge", pkce.codeChallenge);
    params.set("code_challenge_method", "S256");
  }

  const state = generateState(platform, codeVerifier);
  params.set("state", state);

  if (platform === "YouTube" || platform === "LinkedIn") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }

  if (platform === "TikTok") {
    params.set("client_key", config.clientId);
    params.delete("client_id");
  }

  return { url: `${config.authUrl}?${params.toString()}`, state };
}

export function isPlatformConfigured(platform: string): boolean {
  const configFn = PLATFORM_CONFIGS[platform];
  if (!configFn) return false;
  const config = configFn();
  return !!config.clientId && !!config.clientSecret;
}

export async function exchangeCode(platform: string, code: string, codeVerifier?: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userId?: string;
  username?: string;
}> {
  const configFn = PLATFORM_CONFIGS[platform];
  if (!configFn) throw new Error(`Unsupported platform: ${platform}`);

  const config = configFn();
  const redirectUri = `${getRedirectBase()}${config.redirectPath}`;

  const body: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  };

  if (platform === "X/Twitter" && codeVerifier) {
    body.code_verifier = codeVerifier;
  }

  if (platform === "TikTok") {
    body.client_key = config.clientId;
    delete body.client_id;
  }

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed for ${platform}: ${errText}`);
  }

  const data = await res.json();

  let userId: string | undefined;
  let username: string | undefined;

  if (platform === "LinkedIn") {
    try {
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        userId = profile.sub;
        username = profile.name || profile.email;
      }
    } catch {}
  }

  if (platform === "X/Twitter") {
    try {
      const userRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        userId = userData.data?.id;
        username = userData.data?.username;
      }
    } catch {}
  }

  if (platform === "TikTok") {
    userId = data.open_id;
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    userId,
    username,
  };
}

export async function saveTokens(
  platform: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    userId?: string;
    username?: string;
  }
): Promise<void> {
  const existing = await db
    .select()
    .from(socialAccountsTable)
    .where(
      and(
        eq(socialAccountsTable.platform, platform),
        eq(socialAccountsTable.status, "active")
      )
    );

  const tokenExpiresAt = tokens.expiresIn
    ? new Date(Date.now() + tokens.expiresIn * 1000)
    : null;

  if (existing.length > 0) {
    await db
      .update(socialAccountsTable)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || existing[0].refreshToken,
        tokenExpiresAt,
        platformUserId: tokens.userId || existing[0].platformUserId,
        platformUsername: tokens.username || existing[0].platformUsername,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(socialAccountsTable.id, existing[0].id));
  } else {
    await db.insert(socialAccountsTable).values({
      platform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt,
      platformUserId: tokens.userId,
      platformUsername: tokens.username,
      status: "active",
    });
  }
}
