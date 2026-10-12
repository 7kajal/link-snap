import "../global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import {
  AppearanceProvider,
  useAppAppearance,
} from "@/contexts/appearance-context";
import { hydrateHistory } from "@/lib/history";
import { hydrateSettings } from "@/lib/settings";

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const { isDarkMode } = useAppAppearance();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="result" />
            <Stack.Screen name="history" />
          </Stack>
          {/* <AppTabs /> */}
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  // Hold rendering until persisted history + settings are hydrated so the home
  // screen and theme don't flash their default state (splash covers the gap).
  useEffect(() => {
    let mounted = true;
    Promise.all([hydrateHistory(), hydrateSettings()])
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;

  return (
    <AppearanceProvider>
      <AppLayout />
    </AppearanceProvider>
  );
}