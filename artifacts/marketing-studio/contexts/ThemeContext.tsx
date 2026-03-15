import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import type { ColorPalette } from "@/constants/colors";
import { spacing, radius, fonts } from "@/constants/theme";

const THEME_STORAGE_KEY = "sa_theme_mode";

type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setMode(stored);
      }
    }).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: mode === "dark" ? Colors.dark : Colors.light,
      spacing,
      radius,
      fonts,
      isDark: mode === "dark",
      toggleTheme,
    }),
    [mode, toggleTheme]
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
