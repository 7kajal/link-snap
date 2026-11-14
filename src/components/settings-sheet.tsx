import {
  Check,
  ChevronRight,
  Download,
  Monitor,
  Moon,
  Sun,
  SunMoon,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppAppearance, type ThemeMode } from "@/contexts/appearance-context";
import { useUpdate } from "@/contexts/update-context";
import { progressPercent } from "@/lib/updates";

import { BottomDrawer } from "./ui/drawer";
import { UpdatePanel } from "./ui/update-panel";

type SettingsView = "root" | "theme" | "update";

const THEME_OPTIONS: {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  value: ThemeMode;
}[] = [
  {
    icon: Monitor,
    label: "System",
    subtitle: "Follow your device appearance",
    value: "system",
  },
  {
    icon: Sun,
    label: "Light",
    subtitle: "Always use the light theme",
    value: "light",
  },
  {
    icon: Moon,
    label: "Dark",
    subtitle: "Always use the dark theme",
    value: "dark",
  },
];

export function SettingsSheet({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { isDarkMode, setThemeMode, themeMode } = useAppAppearance();
  const { checkForUpdates, currentVersion, downloadProgress, installing, release } =
    useUpdate();
  const [view, setView] = useState<SettingsView>("root");

  const close = () => {
    setView("root");
    onClose();
  };

  const updatesValue = installing
    ? downloadProgress !== null
      ? `Downloading ${progressPercent(downloadProgress)}%`
      : "Downloading…"
    : release
      ? `Update ${release.tagName}`
      : "Up to date";

  const themeValue =
    themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light";

  const title =
    view === "root" ? "Settings" : view === "theme" ? "Theme" : "Updates";
  const description =
    view === "root"
      ? "Appearance and app updates"
      : view === "theme"
        ? "Choose how LinkSnap looks"
        : "Check for the newest version";

  return (
    <BottomDrawer
      description={description}
      onBack={view === "root" ? undefined : () => setView("root")}
      onClose={close}
      open={open}
      title={title}
    >
      {view === "root" ? (
        <View>
          <Text
            className={`text-[11px] font-bold tracking-widest uppercase mb-2 ml-1 ${
              isDarkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Preferences
          </Text>

          <View
            className={`rounded-2xl border overflow-hidden ${
              isDarkMode
                ? "bg-[#141414] border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
          >
            <SettingsRow
              icon={SunMoon}
              label="Theme"
              onPress={() => setView("theme")}
              value={themeValue}
            />
            <View
              className={`h-px ml-14 ${
                isDarkMode ? "bg-zinc-800" : "bg-zinc-200"
              }`}
            />
            <SettingsRow
              icon={Download}
              label="Updates"
              onPress={() => {
                setView("update");
                void checkForUpdates();
              }}
              value={updatesValue}
            />
          </View>

          <Text
            className={`text-[11px] font-semibold text-center mt-6 ${
              isDarkMode ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            LinkSnap v{currentVersion}
          </Text>
        </View>
      ) : null}

      {view === "theme" ? (
        <View className="gap-2.5">
          {THEME_OPTIONS.map((option) => {
            const selected = themeMode === option.value;
            const Icon = option.icon;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() => setThemeMode(option.value)}
                className={`flex-row items-center rounded-2xl border px-4 py-3.5 ${
                  selected
                    ? isDarkMode
                      ? "bg-emerald-500/10 border-emerald-500/40"
                      : "bg-emerald-50 border-emerald-300"
                    : isDarkMode
                      ? "bg-[#141414] border-zinc-800 active:bg-zinc-900"
                      : "bg-white border-zinc-200 active:bg-zinc-50"
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                    selected
                      ? "bg-emerald-500/15"
                      : isDarkMode
                        ? "bg-zinc-900"
                        : "bg-zinc-100"
                  }`}
                >
                  <Icon
                    size={18}
                    color={selected ? "#10b981" : isDarkMode ? "#a1a1aa" : "#52525b"}
                    strokeWidth={2.2}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${
                      isDarkMode ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${
                      isDarkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {option.subtitle}
                  </Text>
                </View>

                {selected ? <Check size={18} color="#10b981" strokeWidth={2.5} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {view === "update" ? <UpdatePanel onDone={close} /> : null}
    </BottomDrawer>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  onPress,
  value,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  value: string;
}) {
  const { isDarkMode } = useAppAppearance();

  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center px-4 py-4 ${
        isDarkMode ? "active:bg-zinc-900" : "active:bg-zinc-50"
      }`}
      onPress={onPress}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
          isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
        }`}
      >
        <Icon size={18} color="#10b981" strokeWidth={2.2} />
      </View>

      <Text
        className={`flex-1 text-base font-bold ${
          isDarkMode ? "text-white" : "text-zinc-900"
        }`}
      >
        {label}
      </Text>

      <Text
        className={`text-sm font-medium mr-1.5 ${
          isDarkMode ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        {value}
      </Text>
      <ChevronRight
        size={18}
        color={isDarkMode ? "#71717a" : "#a1a1aa"}
        strokeWidth={2.2}
      />
    </Pressable>
  );
}
