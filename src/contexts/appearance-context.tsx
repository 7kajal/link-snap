import { createContext, useContext, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { getSetting, setSetting } from "@/lib/settings";

type AppearanceContextValue = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const DARK_MODE_KEY = "app.darkMode";

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<"light" | "dark" | null>(() =>
    getSetting<"light" | "dark" | null>(DARK_MODE_KEY, null),
  );
  const isDarkMode = (override ?? systemScheme ?? "light") === "dark";

  function toggleDarkMode() {
    const next: "light" | "dark" = isDarkMode ? "light" : "dark";
    setOverride(next);
    setSetting(DARK_MODE_KEY, next);
  }

  return (
    <AppearanceContext.Provider
      value={{
        isDarkMode,
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