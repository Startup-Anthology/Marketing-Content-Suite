import React, { createContext, useContext, useMemo } from "react";
import Colors from "@/constants/colors";
import { spacing, radius, fonts } from "@/constants/theme";

interface ThemeContextValue {
  colors: typeof Colors.light;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: Colors.light,
      spacing,
      radius,
      fonts,
      isDark: true,
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
