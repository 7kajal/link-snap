import {
  CheckCircle2,
  CloudOff,
  ExternalLink,
  RefreshCw,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { useAppAppearance } from "@/contexts/appearance-context";
import { useUpdate } from "@/contexts/update-context";
import { progressPercent } from "@/lib/updates";

import { MarkdownView } from "./markdown-view";

/**
 * The shared body for the "What's new" drawer and Settings → Updates.
 * Shows either the newest GitHub release with Skip / Update actions, or a
 * compact "you're up to date" state with a manual re-check.
 */
export function UpdatePanel({ onDone }: { onDone?: () => void }) {
  const { isDarkMode } = useAppAppearance();
  const {
    checkFailed,
    checkForUpdates,
    checking,
    currentVersion,
    downloadProgress,
    installUpdate,
    installing,
    release,
    skipUpdate,
  } = useUpdate();

  if (checking && !release) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator color="#10b981" size="small" />
        <Text
          className={`text-sm font-medium mt-3 ${
            isDarkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Checking for updates…
        </Text>
      </View>
    );
  }

  if (!release && checkFailed) {
    return (
      <View className="items-center py-8">
        <View className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 items-center justify-center">
          <CloudOff size={26} color="#f59e0b" />
        </View>
        <Text
          className={`text-lg font-black mt-4 ${
            isDarkMode ? "text-white" : "text-zinc-900"
          }`}
        >
          Couldn&apos;t check for updates
        </Text>
        <Text
          className={`text-sm text-center mt-1 leading-relaxed ${
            isDarkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Check your connection and try again.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={checking}
          onPress={() => void checkForUpdates()}
          className={`flex-row items-center px-4 py-2.5 rounded-full border mt-5 ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
              : "bg-white border-zinc-200 active:bg-zinc-100"
          }`}
        >
          <RefreshCw
            size={14}
            color={isDarkMode ? "#a1a1aa" : "#52525b"}
            strokeWidth={2.2}
          />
          <Text
            className={`text-xs font-bold ml-2 ${
              isDarkMode ? "text-zinc-300" : "text-zinc-600"
            }`}
          >
            {checking ? "Checking…" : "Try again"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!release) {
    return (
      <View className="items-center py-8">
        <View className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
          <CheckCircle2 size={26} color="#10b981" />
        </View>
        <Text
          className={`text-lg font-black mt-4 ${
            isDarkMode ? "text-white" : "text-zinc-900"
          }`}
        >
          You&apos;re up to date
        </Text>
        <Text
          className={`text-sm text-center mt-1 leading-relaxed ${
            isDarkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          LinkSnap v{currentVersion} is the latest version.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={checking}
          onPress={() => void checkForUpdates()}
          className={`flex-row items-center px-4 py-2.5 rounded-full border mt-5 ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
              : "bg-white border-zinc-200 active:bg-zinc-100"
          }`}
        >
          <RefreshCw
            size={14}
            color={isDarkMode ? "#a1a1aa" : "#52525b"}
            strokeWidth={2.2}
          />
          <Text
            className={`text-xs font-bold ml-2 ${
              isDarkMode ? "text-zinc-300" : "text-zinc-600"
            }`}
          >
            {checking ? "Checking…" : "Check again"}
          </Text>
        </Pressable>
      </View>
    );
  }

  const progress = progressPercent(downloadProgress ?? 0);

  return (
    <View>
      <Text
        className={`text-sm leading-relaxed ${
          isDarkMode ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        You are on {release.currentVersion}. Update to {release.tagName} to get
        the changes below.
      </Text>

      <View
        className={`rounded-2xl border p-4 mt-4 ${
          isDarkMode
            ? "bg-zinc-900/60 border-zinc-800"
            : "bg-zinc-50 border-zinc-200"
        }`}
      >
        {release.body.trim() ? (
          <MarkdownView>{release.body}</MarkdownView>
        ) : (
          <Text
            className={`text-sm leading-relaxed ${
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            The full changelog is on the release page.
          </Text>
        )}
      </View>

      <View className="flex-row gap-3 mt-5">
        <Pressable
          accessibilityRole="button"
          className={`flex-1 h-12 items-center justify-center rounded-2xl border ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
              : "bg-white border-zinc-200 active:bg-zinc-100"
          } ${installing ? "opacity-50" : ""}`}
          disabled={installing}
          onPress={() => {
            void skipUpdate();
            onDone?.();
          }}
        >
          <Text
            className={`text-sm font-bold ${
              isDarkMode ? "text-zinc-200" : "text-zinc-700"
            }`}
          >
            Skip this version
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel={
            installing
              ? `Downloading, ${progress} percent`
              : "Update now"
          }
          accessibilityRole="button"
          className={`flex-1 h-12 items-center justify-center rounded-2xl bg-emerald-500 ${
            installing ? "opacity-80" : "active:opacity-90"
          }`}
          disabled={installing}
          onPress={() => void installUpdate()}
        >
          {installing ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#ffffff" size="small" />
              <Text className="text-white text-sm font-bold ml-2">
                Downloading {progress}%
              </Text>
            </View>
          ) : (
            <Text className="text-white text-sm font-bold">Update now</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="link"
        className="items-center mt-4 py-1"
        onPress={() => void WebBrowser.openBrowserAsync(release.url)}
      >
        <View className="flex-row items-center">
          <ExternalLink
            size={13}
            color={isDarkMode ? "#a1a1aa" : "#71717a"}
          />
          <Text
            className={`text-xs font-semibold underline ml-1.5 ${
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            View release page
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
