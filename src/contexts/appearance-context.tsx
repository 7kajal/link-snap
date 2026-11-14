import { createContext, useContext, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { getSetting, setSetting } from "@/lib/settings";

export type ThemeMode = "system" | "light" | "dark";

type AppearanceContextValue = {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
};

const THEME_MODE_KEY = "app.themeMode";
const LEGACY_DARK_MODE_KEY = "app.darkMode";

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function readInitialThemeMode(): ThemeMode {
  const stored = getSetting<ThemeMode | null>(THEME_MODE_KEY, null);
  if (stored === "system" || stored === "light" || stored === "dark") {
    return stored;
  }

  // Migrate the old boolean toggle so users keep their chosen appearance.
  const legacy = getSetting<boolean | null>(LEGACY_DARK_MODE_KEY, null);
  if (typeof legacy === "boolean") return legacy ? "dark" : "light";

  return "system";
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readInitialThemeMode);

  const isDarkMode =
    (themeMode === "system" ? (systemScheme ?? "light") : themeMode) === "dark";

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    setSetting(THEME_MODE_KEY, mode);
  }

  function toggleDarkMode() {
    setThemeMode(isDarkMode ? "light" : "dark");
  }

  return (
    <AppearanceContext.Provider
      value={{
        isDarkMode,
        setThemeMode,
        themeMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) {
    throw new Error("useAppAppearance must be used within AppearanceProvider");
  }
  return value;
}
