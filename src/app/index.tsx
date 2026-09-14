import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard as ClipboardIcon,
  Copy,
  Flame,
  Globe,
  Layers,
  Link2,
  Moon,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  XCircle,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { BottomTabInset, shadowMd } from "@/constants/theme";
import { clearHistory, useHistory } from "@/lib/history";

export default function HomeScreen() {
  const router = useRouter();
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const history = useHistory();

  function extractUrl(text: string): string {
    const matched = text.match(/(https?:\/\/[^\s]+)/g);
    return matched ? matched[0] : text.trim();
  }

  // Re-check clipboard whenever the user returns to this screen
  useFocusEffect(
    useCallback(() => {
      async function checkClipboard() {
        try {
          const hasUrl = await Clipboard.hasUrlAsync();
          if (hasUrl) {
            const text = await Clipboard.getStringAsync();
            if (text) {
              const extracted = extractUrl(text);
              if (
                extracted.startsWith("http://") ||
                extracted.startsWith("https://")
              ) {
                setClipboardUrl(extracted);
              }
            }
          }
        } catch {
          // Ignore permission or platform errors gracefully
        }
      }
      checkClipboard();
    }, []),
  );

  function openResult(targetUrl?: string) {
    const rawInput = targetUrl || url;
    const cleanUrl = extractUrl(rawInput);

    if (!cleanUrl) {
      setError("Please enter or paste a valid URL first.");
      return;
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      setError("Please ensure the link starts with http:// or https://");
      return;
    }

    setError(null);
    router.push({ pathname: "/result", params: { url: cleanUrl } });
  }

  async function handlePaste() {
    setBusy(true);
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        const cleaned = extractUrl(text);
        setUrl(cleaned);
        setError(null);
      }
    } finally {
      setBusy(false);
    }
  }

  const steps = [
    {
      icon: Copy,
      title: "Paste Any Link",
      desc: "Copy an article, tweet, or website URL and paste it into LinkSnap.",
    },
    {
      icon: Layers,
      title: "Customize Design",
      desc: "Auto-extract metadata into clean, high-impact shareable story cards.",
    },
    {
      icon: Share2,
      title: "Share Everywhere",
      desc: "Export image cards directly to Instagram, WhatsApp, X, or LinkedIn.",
    },
  ];

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-[#09090b]" : "bg-zinc-50"}`}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <SafeAreaView
          edges={["top"]}
          style={{ paddingBottom: BottomTabInset }}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="w-full max-w-lg self-center"
          >
          {/* Top Navigation Bar */}
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View
                className="w-11 h-11 rounded-2xl bg-emerald-500 items-center justify-center mr-3"
                style={shadowMd}
              >
                <Link2 size={22} color="#ffffff" strokeWidth={2.5} />
              </View>
              <View>
                <Text
                  className={`text-2xl font-black tracking-tight ${
                    isDarkMode ? "text-white" : "text-zinc-900"
                  }`}
                >
                  LinkSnap
                </Text>
                <Text
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  URL to Story Engine
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setIsDarkMode(!isDarkMode)}
              accessibilityLabel="Toggle Dark Mode"
              accessibilityRole="button"
              className={`w-11 h-11 items-center justify-center rounded-2xl border ${
                isDarkMode
                  ? "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
                  : "bg-white border-zinc-200 active:bg-zinc-100"
              }`}
            >
              {isDarkMode ? (
                <Sun size={18} color="#fbbf24" strokeWidth={2.2} />
              ) : (
                <Moon size={18} color="#3f3f46" strokeWidth={2.2} />
              )}
            </Pressable>
          </View>

          {/* Hero Section */}
          <View className="items-center mb-8 mt-2">
            <View
              className={`flex-row items-center px-3 py-1.5 rounded-full border mb-4 ${
                isDarkMode
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <Sparkles size={13} color="#10b981" />
              <Text className="text-emerald-500 text-xs font-bold tracking-wide uppercase ml-1.5">
                Instant Visual Generation
              </Text>
            </View>

            <Text
              className={`text-[30px] max-w-xs font-black text-center leading-tight mb-3 ${
                isDarkMode ? "text-white" : "text-zinc-900"
              }`}
            >
              Turn Any Link Into Social Stories
            </Text>
            <Text
              className={`text-base text-center leading-relaxed max-w-sm ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Convert web pages into stunning image cards ready for Instagram,
              LinkedIn, X, and WhatsApp.
            </Text>
          </View>

          {/* Clipboard Banner Notification */}
          {clipboardUrl && !url && (
            <View
              className={`p-3.5 rounded-2xl border mb-4 flex-row items-center justify-between ${
                isDarkMode
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <View className="flex-1 mr-3">
                <Text
                  className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  Link Found On Clipboard
                </Text>
                <Text
                  numberOfLines={1}
                  className={`text-xs ${
                    isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {clipboardUrl}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setUrl(clipboardUrl);
                  openResult(clipboardUrl);
                }}
                className="bg-emerald-500 px-3.5 py-2.5 rounded-xl flex-row items-center"
              >
                <Text className="text-white text-xs font-bold mr-1">
                  Use Link
                </Text>
                <ArrowRight size={12} color="#ffffff" />
              </Pressable>
            </View>
          )}

          {/* Input Box Section */}
          <View className="mb-3">
            <View
              className={`flex-row items-center border rounded-2xl px-4 h-16 ${
                isDarkMode
                  ? `bg-[#141414] ${isFocused ? "border-emerald-500" : "border-zinc-800"}`
                  : `bg-white ${isFocused ? "border-emerald-500" : "border-zinc-300"}`
              }`}
            >
              <Link2
                size={20}
                color={isDarkMode ? "#71717a" : "#a1a1aa"}
                strokeWidth={2}
              />
              <TextInput
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  if (error) setError(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste URL or website link..."
                placeholderTextColor={isDarkMode ? "#52525b" : "#a1a1aa"}
                className={`flex-1 text-base h-full font-medium ml-2.5 ${
                  isDarkMode ? "text-white" : "text-zinc-900"
                }`}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={() => openResult()}
              />

              {url.length > 0 ? (
                <Pressable
                  onPress={() => setUrl("")}
                  hitSlop={12}
                  className="p-2"
                  accessibilityLabel="Clear input"
                >
                  <XCircle
                    size={18}
                    color={isDarkMode ? "#71717a" : "#a1a1aa"}
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={handlePaste}
                  className="bg-emerald-500/15 active:bg-emerald-500/25 rounded-xl px-3 py-2 ml-2 flex-row items-center"
                  hitSlop={8}
                >
                  <ClipboardIcon size={14} color="#10b981" strokeWidth={2.5} />
                  <Text className="text-emerald-500 text-xs font-bold tracking-wider ml-1.5">
                    PASTE
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Primary Action Button */}
          <Pressable
            onPress={() => openResult()}
            disabled={busy}
            className={`h-16 rounded-2xl bg-emerald-500 items-center justify-center flex-row mb-6 ${
              busy ? "opacity-70" : "active:opacity-90"
            }`}
            style={shadowMd}
          >
            {busy ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Sparkles size={20} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold text-lg tracking-wide ml-2.5">
                  Generate Story Card
                </Text>
              </>
            )}
          </Pressable>

          {/* Error Message */}
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex-row items-center">
              <XCircle size={18} color="#ef4444" />
              <Text className="text-red-500 text-sm font-medium flex-1 ml-2.5">
                {error}
              </Text>
            </View>
          )}

          {/* History / First-Time Guide Toggle */}
          <View className="mt-2">
            {history.length > 0 ? (
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Flame size={18} color="#10b981" />
                    <Text
                      className={`text-xs font-bold tracking-wider uppercase ml-2 ${
                        isDarkMode ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Recent Generations
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => clearHistory()}
                    hitSlop={12}
                    className="p-1"
                    accessibilityLabel="Clear history"
                  >
                    <Trash2
                      size={16}
                      color={isDarkMode ? "#71717a" : "#a1a1aa"}
                    />
                  </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {history.map((item, idx) => (
                    <Pressable
                      key={`${item.url}-${idx}`}
                      onPress={() => {
                        setUrl(item.url);
                        router.push({
                          pathname: "/result",
                          params: { url: item.url },
                        });
                      }}
                      className={`w-48 p-3 rounded-2xl border mr-3 ${
                        isDarkMode
                          ? "bg-[#141414] border-zinc-800 active:border-zinc-700"
                          : "bg-white border-zinc-200 active:border-zinc-300"
                      }`}
                    >
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-28 rounded-xl mb-2.5 bg-zinc-800"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-28 rounded-xl mb-2.5 bg-emerald-500/10 items-center justify-center">
                          <Globe size={28} color="#10b981" />
                        </View>
                      )}
                      <Text
                        numberOfLines={1}
                        className={`text-sm font-bold mb-0.5 ${
                          isDarkMode ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-xs text-zinc-500 font-medium"
                      >
                        {item.url}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : (
              /* How It Works Section */
              <View>
                <Text
                  className={`text-2xl font-black tracking-tight px-1 mb-4 ${
                    isDarkMode ? "text-white" : "text-zinc-900"
                  }`}
                >
                  How It Works
                </Text>

                <View className="py-1">
                  {steps.map((item, idx) => {
                    const Icon = item.icon;
                    const isLast = idx === steps.length - 1;
                    return (
                      <View key={idx} className="flex-row items-start mb-4">
                        <View className="items-center mr-4">
                          <View className="w-11 h-11 rounded-2xl bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
                            <Icon size={18} color="#10b981" strokeWidth={2.5} />
                          </View>
                          {!isLast && (
                            <View
                              className={`w-[1px] h-8 mt-2 ${
                                isDarkMode ? "bg-zinc-800" : "bg-zinc-300"
                              }`}
                            />
                          )}
                        </View>

                        <View className="flex-1 pt-0.5">
                          <Text
                            className={`text-lg font-bold ${
                              isDarkMode ? "text-white" : "text-zinc-900"
                            }`}
                          >
                            {item.title}
                          </Text>
                          <Text
                            className={`text-sm mt-1 leading-relaxed ${
                              isDarkMode ? "text-zinc-400" : "text-zinc-600"
                            }`}
                          >
                            {item.desc}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Pro Tip Callout */}
                <View
                  className={`flex-row items-center p-3.5 rounded-2xl border mt-2 ${
                    isDarkMode
                      ? "bg-emerald-500/5 border-emerald-500/15"
                      : "bg-emerald-50 border-emerald-200/60"
                  }`}
                >
                  <CheckCircle2 size={18} color="#10b981" />
                  <Text
                    className={`text-sm font-medium flex-1 ml-3 leading-normal ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-800"
                    }`}
                  >
                    Works seamlessly with articles, blogs, Twitter/X posts, and
                    e-commerce product links.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
