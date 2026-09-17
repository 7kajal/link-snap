import "../global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import {
  AppearanceProvider,
  useAppAppearance,
} from "@/contexts/appearance-context";

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
          </Stack>
          {/* <AppTabs /> */}
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <AppLayout />
    </AppearanceProvider>
  );
}
