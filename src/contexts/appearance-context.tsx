import { createContext, useContext, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

type AppearanceContextValue = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<"light" | "dark" | null>(null);
  const isDarkMode = (override ?? systemScheme ?? "light") === "dark";

  return (
    <AppearanceContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode: () => setOverride(isDarkMode ? "light" : "dark"),
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
