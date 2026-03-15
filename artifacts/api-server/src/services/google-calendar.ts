import { db } from "@workspace/db";
import { scheduledPostsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

let googleCalendarTokens: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null = null;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

function getRedirectUri(req?: { protocol?: string; get?: (h: string) => string | undefined }) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}/api/google-calendar/callback`;
  return "http://localhost:3000/api/google-calendar/callback";
}

export function isGoogleCalendarConnected(): boolean {
  return googleCalendarTokens !== null && !!googleCalendarTokens.accessToken;
}

export function getGoogleAuthUrl(): string {
  const redirectUri = getRedirectUri();
  const scopes = encodeURIComponent("https://www.googleapis.com/auth/calendar.events");
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const redirectUri = getRedirectUri();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await response.json();
  googleCalendarTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || googleCalendarTokens?.refreshToken || "",
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function getValidAccessToken(): Promise<string | null> {
  if (!googleCalendarTokens) return null;

  if (Date.now() >= googleCalendarTokens.expiresAt - 60000) {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: googleCalendarTokens.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      googleCalendarTokens = null;
      return null;
    }

    const data = await response.json();
    googleCalendarTokens.accessToken = data.access_token;
    googleCalendarTokens.expiresAt = Date.now() + data.expires_in * 1000;
  }

  return googleCalendarTokens.accessToken;
}

export async function createCalendarEvent(post: {
  id: number;
  platform: string;
  content: string;
  scheduledAt: Date;
}): Promise<string | null> {
  const token = await getValidAccessToken();
  if (!token) return null;

  const startTime = new Date(post.scheduledAt);
  const endTime = new Date(startTime.getTime() + 30 * 60000);

  const event = {
    summary: `[${post.platform}] Scheduled Post`,
    description: post.content.slice(0, 500),
    start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
    end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
    colorId: "9",
  };

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const eventId = data.id;

  await db
    .update(scheduledPostsTable)
    .set({ googleCalendarEventId: eventId })
    .where(eq(scheduledPostsTable.id, post.id));

  return eventId;
}

export async function updateCalendarEvent(
  eventId: string,
  post: { platform: string; content: string; scheduledAt: Date }
): Promise<boolean> {
  const token = await getValidAccessToken();
  if (!token) return false;

  const startTime = new Date(post.scheduledAt);
  const endTime = new Date(startTime.getTime() + 30 * 60000);

  const event = {
    summary: `[${post.platform}] Scheduled Post`,
    description: post.content.slice(0, 500),
    start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
    end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  return response.ok;
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getValidAccessToken();
  if (!token) return false;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.ok || response.status === 404;
}

export function disconnectGoogleCalendar(): void {
  googleCalendarTokens = null;
}
