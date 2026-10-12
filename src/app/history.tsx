import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Search, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppAppearance } from "@/contexts/appearance-context";
import {
  clearHistory,
  deleteHistoryItem,
  type HistoryItem,
  useHistory,
} from "@/lib/history";

type TimeChip = "all" | "7d" | "30d" | "year";

const TIME_CHIPS: { id: TimeChip; label: string }[] = [
  { id: "all", label: "All" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "year", label: "This year" },
];

function chipCutoff(chip: TimeChip, now: number): number | null {
  switch (chip) {
    case "all":
      return null;
    case "7d":
      return now - 7 * 86_400_000;
    case "30d":
      return now - 30 * 86_400_000;
    case "year": {
      const d = new Date(now);
      return new Date(d.getFullYear(), 0, 1).getTime();
    }
  }
}

function formatDate(ts: number): string {
  const date = new Date(ts);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HistoryRow({
  item,
  isDarkMode,
  onOpen,
  onDelete,
}: {
  item: HistoryItem;
  isDarkMode: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      onPress={onOpen}
      className={`flex-row items-center p-3 rounded-2xl border mb-3 ${
        isDarkMode
          ? "bg-[#141414] border-zinc-800 active:border-zinc-700"
          : "bg-white border-zinc-200 active:border-zinc-300"
      }`}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          className="w-16 h-16 rounded-xl bg-zinc-800"
          resizeMode="cover"
        />
      ) : (
        <View className="w-16 h-16 rounded-xl bg-emerald-500/10 items-center justify-center">
          <Globe size={24} color="#10b981" />
        </View>
      )}
      <View className="flex-1 ml-3 pr-2">
        <Text
          numberOfLines={2}
          className={`text-sm font-bold leading-snug ${
            isDarkMode ? "text-white" : "text-zinc-900"
          }`}
        >
          {item.title || item.url}
        </Text>
        <Text
          numberOfLines={1}
          className="text-xs text-zinc-500 font-medium mt-1"
        >
          {item.url}
        </Text>
        <Text className="text-[11px] font-semibold text-zinc-400 mt-1">
          {formatDate(item.generatedAt)}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={10}
        className="p-2"
        accessibilityLabel="Delete link"
      >
        <Trash2 size={17} color={isDarkMode ? "#71717a" : "#a1a1aa"} />
      </Pressable>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { isDarkMode } = useAppAppearance();
  const history = useHistory();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<TimeChip>("all");
  // Snapshot clock into state (refreshed every minute) so time filtering stays
  // pure during render; the listed cutoff only needs ~minute precision.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const cutoff = chipCutoff(chip, now);
    const q = query.trim().toLowerCase();
    return history.filter((item) => {
      if (cutoff != null && item.generatedAt < cutoff) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    });
  }, [history, chip, query, now]);

  function openItem(item: HistoryItem) {
    router.push({ pathname: "/result", params: { url: item.url } });
  }

  function confirmDelete(item: HistoryItem) {
    Alert.alert("Delete link?", `Remove “${item.title || item.url}” from history?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteHistoryItem(item.url),
      },
    ]);
  }

  function confirmClearAll() {
    Alert.alert(
      "Clear all history?",
      `This permanently deletes all ${history.length} saved links.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: () => clearHistory() },
      ],
    );
  }

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-[#09090b]" : "bg-zinc-50"}`}>
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: 48,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="w-full max-w-lg self-center"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                accessibilityLabel="Go back"
                className={`p-2.5 rounded-full border mr-3 ${
                  isDarkMode
                    ? "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
                    : "bg-white border-zinc-200 active:bg-zinc-100"
                }`}
              >
                <ArrowLeft
                  size={16}
                  color={isDarkMode ? "#e4e4e7" : "#3f3f46"}
                  strokeWidth={2.2}
                />
              </Pressable>
              <Text
                className={`text-2xl font-black tracking-tight ${
                  isDarkMode ? "text-white" : "text-zinc-900"
                }`}
              >
                History
              </Text>
            </View>
            {history.length > 0 ? (
              <Pressable
                onPress={confirmClearAll}
                hitSlop={8}
                accessibilityLabel="Clear all history"
                className="p-2"
              >
                <Trash2
                  size={18}
                  color={isDarkMode ? "#71717a" : "#a1a1aa"}
                />
              </Pressable>
            ) : null}
          </View>

          {/* Search */}
          <View
            className={`flex-row items-center border rounded-2xl px-4 h-12 mb-3 ${
              isDarkMode
                ? "bg-[#141414] border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >
            <Search
              size={18}
              color={isDarkMode ? "#71717a" : "#a1a1aa"}
              strokeWidth={2}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search title or URL..."
              placeholderTextColor={isDarkMode ? "#52525b" : "#a1a1aa"}
              className={`flex-1 text-sm h-full font-medium ml-2.5 ${
                isDarkMode ? "text-white" : "text-zinc-900"
              }`}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Time chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
            className="mb-3"
          >
            {TIME_CHIPS.map((c) => {
              const active = chip === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setChip(c.id)}
                  className={`px-4 py-2 rounded-full border ${
                    active
                      ? "bg-emerald-500/20 border-emerald-500"
                      : isDarkMode
                        ? "bg-zinc-900 border-zinc-800"
                        : "bg-white border-zinc-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active
                        ? "text-emerald-500"
                        : isDarkMode
                          ? "text-zinc-300"
                          : "text-zinc-600"
                    }`}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Count */}
          {history.length > 0 ? (
            <Text
              className={`text-xs font-bold tracking-wider uppercase mb-3 ${
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {filtered.length} of {history.length} saved
            </Text>
          ) : null}

          {/* Empty / list */}
          {history.length === 0 ? (
            <View className="items-center py-16 px-6">
              <Globe size={32} color="#10b981" strokeWidth={1.8} />
              <Text
                className={`text-lg font-bold mt-4 text-center ${
                  isDarkMode ? "text-white" : "text-zinc-900"
                }`}
              >
                No saved links yet
              </Text>
              <Text
                className={`text-sm text-center mt-1 leading-relaxed ${
                  isDarkMode ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Generate a story card and it will stay saved here, even after
                you close the app.
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View className="items-center py-16 px-6">
              <Search size={32} color="#a1a1aa" strokeWidth={1.8} />
              <Text
                className={`text-lg font-bold mt-4 text-center ${
                  isDarkMode ? "text-white" : "text-zinc-900"
                }`}
              >
                Nothing matches
              </Text>
              <Text
                className={`text-sm text-center mt-1 leading-relaxed ${
                  isDarkMode ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Try a different search or time filter.
              </Text>
            </View>
          ) : (
            <View>
              {filtered.map((item) => (
                <HistoryRow
                  key={item.url}
                  item={item}
                  isDarkMode={isDarkMode}
                  onOpen={() => openItem(item)}
                  onDelete={() => confirmDelete(item)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}