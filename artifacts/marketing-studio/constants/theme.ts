import Colors from "./colors";

const c = Colors.light;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const fonts = {
  regular: "Inter_400Regular" as const,
  medium: "Inter_500Medium" as const,
  semibold: "Inter_600SemiBold" as const,
  bold: "Inter_700Bold" as const,
};

export const platformColors: Record<string, string> = {
  LinkedIn: "#0A66C2",
  "X/Twitter": "#1DA1F2",
  Instagram: "#E1306C",
  Email: "#BB935B",
  TikTok: "#00F2EA",
  YouTube: "#FF0000",
  Facebook: "#1877F2",
};

export const platformIcons: Record<string, { family: string; name: string }> = {
  LinkedIn: { family: "MaterialCommunityIcons", name: "linkedin" },
  "X/Twitter": { family: "MaterialCommunityIcons", name: "twitter" },
  Instagram: { family: "MaterialCommunityIcons", name: "instagram" },
  Email: { family: "MaterialCommunityIcons", name: "email-outline" },
  TikTok: { family: "MaterialCommunityIcons", name: "music-note" },
  YouTube: { family: "MaterialCommunityIcons", name: "youtube" },
  Facebook: { family: "MaterialCommunityIcons", name: "facebook" },
};

export { c as colors };
