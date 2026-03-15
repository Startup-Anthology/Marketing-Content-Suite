import { db } from "@workspace/db";
import { scheduledPostsTable } from "@workspace/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { publishToplatform, getSocialAccount } from "./social-posting";

let intervalId: ReturnType<typeof setInterval> | null = null;

export async function processScheduledPosts(): Promise<void> {
  try {
    const now = new Date();
    const readyPosts = await db
      .select()
      .from(scheduledPostsTable)
      .where(
        and(
          eq(scheduledPostsTable.status, "ready"),
          lte(scheduledPostsTable.scheduledAt, now)
        )
      );

    for (const post of readyPosts) {
      if (post.platform === "Email") continue;

      const account = await getSocialAccount(post.platform);
      if (!account) continue;

      const [claimed] = await db
        .update(scheduledPostsTable)
        .set({ status: "publishing", updatedAt: new Date() })
        .where(
          and(
            eq(scheduledPostsTable.id, post.id),
            eq(scheduledPostsTable.status, "ready")
          )
        )
        .returning();

      if (!claimed) continue;

      console.log(`Auto-publishing post ${post.id} to ${post.platform}...`);
      const result = await publishToplatform(post.platform, post.content);

      if (result.success) {
        await db
          .update(scheduledPostsTable)
          .set({ status: "published", updatedAt: new Date() })
          .where(eq(scheduledPostsTable.id, post.id));
        console.log(`Post ${post.id} published successfully to ${post.platform}`);
      } else {
        await db
          .update(scheduledPostsTable)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(scheduledPostsTable.id, post.id));
        console.error(`Post ${post.id} failed to publish: ${result.error}`);
      }
    }
  } catch (err) {
    console.error("Auto-publish job error:", err);
  }
}

export function startAutoPublishJob(intervalMs = 60000): void {
  if (intervalId) return;
  console.log("Auto-publish job started (checking every 60s)");
  intervalId = setInterval(processScheduledPosts, intervalMs);
  processScheduledPosts();
}

export function stopAutoPublishJob(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Auto-publish job stopped");
  }
}
