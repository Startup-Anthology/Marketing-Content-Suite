import { db } from "@workspace/db";
import { brandGuideTable } from "@workspace/db/schema";

export async function getBrandContextBlock(): Promise<string> {
  const items = await db.select().from(brandGuideTable).limit(1);
  if (items.length === 0) return "";

  const guide = items[0];
  const parts: string[] = [];

  parts.push("=== BRAND GUIDE CONTEXT ===");

  if (guide.brandName) {
    parts.push(`Brand Name: ${guide.brandName}`);
  }
  if (guide.tagline) {
    parts.push(`Tagline: ${guide.tagline}`);
  }
  if (guide.voiceDescriptors) {
    parts.push(`Brand Voice: ${guide.voiceDescriptors}`);
  }
  if (guide.tone) {
    parts.push(`Tone: ${guide.tone}`);
  }
  if (guide.brandStory) {
    parts.push(`Brand Story: ${guide.brandStory}`);
  }

  try {
    const colors = JSON.parse(guide.colorPalette);
    if (Array.isArray(colors) && colors.length > 0) {
      const colorStr = colors.map((c: { name: string; hex: string }) => `${c.name} (${c.hex})`).join(", ");
      parts.push(`Brand Colors: ${colorStr}`);
    }
  } catch {}

  try {
    const fonts = JSON.parse(guide.fonts);
    if (Array.isArray(fonts) && fonts.length > 0) {
      const fontStr = fonts.map((f: { role: string; name: string }) => `${f.role}: ${f.name}`).join(", ");
      parts.push(`Brand Fonts: ${fontStr}`);
    }
  } catch {}

  parts.push("Use this brand identity to ensure all generated content reflects the brand's voice, tone, preferred terminology, and visual style.");
  parts.push("=== END BRAND GUIDE ===");

  return parts.join("\n");
}
