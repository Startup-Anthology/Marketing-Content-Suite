const SA_GOLD = "#BB935B";
const GOLD_LIGHT = "#D4B07A";
const GOLD_DARK = "#9A7545";
const SUCCESS = "#22C55E";
const ERROR = "#EF4444";
const WARNING = "#F59E0B";

export type ColorPalette = {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHigh: string;
  tint: string;
  tintLight: string;
  tintDark: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
  borderLight: string;
  inputBg: string;
  success: string;
  error: string;
  warning: string;
  cardBg: string;
  white: string;
  gray100: string;
  gray200: string;
};

const dark: ColorPalette = {
  text: "#FFFFFF",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  background: "#000000",
  surface: "#111111",
  surfaceElevated: "#1A1A1A",
  surfaceHigh: "#2A2A2A",
  tint: SA_GOLD,
  tintLight: GOLD_LIGHT,
  tintDark: GOLD_DARK,
  tabIconDefault: "#64748B",
  tabIconSelected: SA_GOLD,
  border: "#2A2A2A",
  borderLight: "#1A1A1A",
  inputBg: "#1A1A1A",
  success: SUCCESS,
  error: ERROR,
  warning: WARNING,
  cardBg: "#111111",
  white: "#FFFFFF",
  gray100: "#F8FAFC",
  gray200: "#E2E8F0",
};

const light: ColorPalette = {
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  background: "#FFFFFF",
  surface: "#F5F5F7",
  surfaceElevated: "#EFEFEF",
  surfaceHigh: "#E5E5E7",
  tint: SA_GOLD,
  tintLight: GOLD_LIGHT,
  tintDark: GOLD_DARK,
  tabIconDefault: "#9CA3AF",
  tabIconSelected: SA_GOLD,
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  inputBg: "#F9FAFB",
  success: SUCCESS,
  error: ERROR,
  warning: WARNING,
  cardBg: "#F5F5F7",
  white: "#FFFFFF",
  gray100: "#F8FAFC",
  gray200: "#E2E8F0",
};

export default { dark, light };
