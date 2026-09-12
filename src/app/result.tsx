import {
  ArrowLeft,
  Camera,
  Check,
  CircleDot,
  Droplets,
  Image as ImageIcon,
  Layers,
  MessageCircle,
  Palette,
  PenLine,
  Pipette,
  Share2,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { PNG } from "pngjs/browser";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import LinkCardView, { type CardBackgroundMode, type CardTheme } from "@/components/link-card-view";
import { SkeletonCard } from "@/components/skeleton-card";
import { fetchLinkPreview, type LinkPreview, type TwitchKind, type YouTubeKind } from "@/lib/link-preview";
import { hexToHsv, hsvToHex } from "@/lib/palette";
import { addHistoryItem } from "@/lib/history";
import { useImageSize } from "@/lib/use-image-size";
import {
  getAvailableTargets,
  SHARE_TARGETS,
  shareToTarget,
  type ShareTargetId,
} from "@/lib/share-targets";

const TARGET_ICONS: Record<ShareTargetId, "camera" | "message" | "facebook" | "more"> = {
  instagram: "camera",
  whatsapp: "message",
  facebook: "facebook",
  more: "more",
};

const BG_PRESETS: { label: string; value: string }[] = [
  { label: "Midnight", value: "#0B0B12" },
  { label: "Slate", value: "#1E293B" },
  { label: "Zinc", value: "#27272A" },
  { label: "Sky", value: "#075985" },
  { label: "Emerald", value: "#065F46" },
  { label: "Amber", value: "#B45309" },
  { label: "Rose", value: "#9F1239" },
  { label: "Violet", value: "#4C1D95" },
];

type ToolId = "theme" | "bg" | "details" | "blur" | "vignette";

const TOOLS: { id: ToolId; label: string; icon: typeof Layers }[] = [
  { id: "theme", label: "Presets", icon: Layers },
  { id: "details", label: "Edit", icon: PenLine },
  { id: "bg", label: "BG", icon: Palette },
  { id: "blur", label: "Blur", icon: Droplets },
  { id: "vignette", label: "Vignette", icon: CircleDot },
];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TargetIcon({ target, color }: { target: ShareTargetId; color: string }) {
  const kind = TARGET_ICONS[target];
  if (kind === "camera") return <Camera size={18} color="#ffffff" strokeWidth={2.2} />;
  if (kind === "message") return <MessageCircle size={18} color="#ffffff" strokeWidth={2.2} />;
  if (kind === "more") return <Share2 size={18} color="#ffffff" strokeWidth={2.2} />;
  return (
    <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "900" }}>f</Text>
  );
}

function ValueSlider({
  value,
  maximumValue,
  step,
  onChange,
}: {
  value: number;
  maximumValue: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const responder = useMemo(
    () => {
      const update = (x: number) => {
        if (width <= 0) return;
        const raw = Math.max(0, Math.min(1, x / width)) * maximumValue;
        onChange(Math.round(raw / step) * step);
      };
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => update(event.nativeEvent.locationX),
        onPanResponderMove: (event) => update(event.nativeEvent.locationX),
      });
    },
    [width, maximumValue, step, onChange],
  );
  const progress = `${(value / maximumValue) * 100}%` as `${number}%`;

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      {...responder.panHandlers}
      style={{ height: 36, justifyContent: "center" }}
    >
      <View style={{ height: 6, borderRadius: 999, backgroundColor: "#E4E4E7" }}>
        <View style={{ width: progress, height: 6, borderRadius: 999, backgroundColor: "#10B981" }} />
      </View>
      <View
        style={{
          position: "absolute",
          left: progress,
          width: 22,
          height: 22,
          marginLeft: -11,
          borderRadius: 11,
          backgroundColor: "#FFFFFF",
          borderWidth: 3,
          borderColor: "#10B981",
          elevation: 2,
        }}
      />
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { url: urlParam } = useLocalSearchParams<{ url?: string }>();
  const systemScheme = useColorScheme();
  const isDarkMode = systemScheme === "dark";
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const cardRef = useRef<View>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingTarget, setSharingTarget] = useState<ShareTargetId | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [editing, setEditing] = useState(false);
  const [available, setAvailable] = useState<Record<ShareTargetId, boolean>>({
    instagram: false,
    whatsapp: false,
    facebook: false,
    more: true,
  });

  // Customization States
  const [theme, setTheme] = useState<CardTheme>("editorial");
  const [bgMode, setBgMode] = useState<CardBackgroundMode>("image");
  const [bgColor, setBgColor] = useState("#0B0B12");
  const [backgroundImage, setBackgroundImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [backgroundPreviewWidth, setBackgroundPreviewWidth] = useState(0);
  const [eyedropperSize, setEyedropperSize] = useState({ width: 0, height: 0 });
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [samplingColor, setSamplingColor] = useState(false);
  const [blurStrength, setBlurStrength] = useState(8);
  const [vignetteStrength, setVignetteStrength] = useState(0);
  const [customHsv, setCustomHsv] = useState({ h: 240, s: 0.39, v: 0.07 });
  const [hexText, setHexText] = useState("#0B0B12");
  const [svSize, setSvSize] = useState({ w: 0, h: 0 });
  const [hueWidth, setHueWidth] = useState(0);

  // Card detail overrides (empty = auto from link metadata)
  const [author, setAuthor] = useState("");
  const [readMinutes, setReadMinutes] = useState("");
  const [dateText, setDateText] = useState("");
  const [location, setLocation] = useState("");

  // Tweet/X extras (auto from oEmbed when available, else manual)
  const [tweetHandle, setTweetHandle] = useState("");
  const [tweetVerified, setTweetVerified] = useState(false);
  const [tweetLikes, setTweetLikes] = useState("");
  const [tweetReplies, setTweetReplies] = useState("");
  const [tweetAvatar, setTweetAvatar] = useState("");

  // YouTube extras (auto from worker/scrape when available, else manual)
  const [ytKind, setYtKind] = useState<YouTubeKind | "">("");
  const [ytDuration, setYtDuration] = useState("");
  const [ytViews, setYtViews] = useState("");
  const [ytWatching, setYtWatching] = useState("");

  // Reddit extras
  const [postSubreddit, setPostSubreddit] = useState("");
  const [postScore, setPostScore] = useState("");

  // Commerce extras (manual-first for Amazon/Flipkart/Meesho)
  const [cPrice, setCPrice] = useState("");
  const [cMrp, setCMrp] = useState("");
  const [cRating, setCRating] = useState("");
  const [cSeller, setCSeller] = useState("");

  // Twitch extras (auto from Worker Helix when configured, else manual)
  const [streamKind, setStreamKind] = useState<TwitchKind | "">("");
  const [streamGame, setStreamGame] = useState("");
  const [streamViewers, setStreamViewers] = useState("");

  function applyPreviewDetails(result: LinkPreview) {
    // Pre-fill editable details from parsed metadata (user can tweak)
    setAuthor(result.author || "");
    setReadMinutes(result.readingMinutes ? String(result.readingMinutes) : "");
    setDateText("");
    setLocation(result.isTweet || result.isYouTube ? "" : result.siteName || "");
    setTweetHandle(result.handle || "");
    setTweetVerified(result.verified);
    setTweetLikes(result.likeCount != null ? String(result.likeCount) : "");
    setTweetReplies(result.replyCount != null ? String(result.replyCount) : "");
    setTweetAvatar(result.avatar || "");
    setYtKind("");
    setYtDuration(result.durationSec != null ? String(result.durationSec) : "");
    setYtViews(result.viewCount != null ? String(result.viewCount) : "");
    setYtWatching(
      result.concurrentViewers != null ? String(result.concurrentViewers) : "",
    );
    setPostSubreddit(result.subreddit || "");
    setPostScore(result.postScore != null ? String(result.postScore) : "");
    setCPrice(result.commercePrice || "");
    setCMrp(result.commerceMrp || "");
    setCRating(result.commerceRating != null ? String(result.commerceRating) : "");
    setCSeller(result.commerceSeller || "");
    setStreamKind("");
    setStreamGame(result.gameName || "");
    setStreamViewers(
      result.viewerCount != null
        ? String(result.viewerCount)
        : result.viewCount != null
          ? String(result.viewCount)
          : "",
    );
    if (result.isTwitch) {
      // Without worker creds the title/author are empty — keep the handle
      // handy so the card still labels the channel.
      if (!result.author && result.twitchLogin) setAuthor(result.twitchLogin);
    }
    // Auto-detect: platform links switch to their template
    if (result.isTweet) setTheme("tweet");
    else if (result.isYouTube) setTheme("youtube");
    else if (result.isTwitch) setTheme("stream");
    else if (result.isTikTok) setTheme("clip");
    else if (result.isReddit) setTheme("post");
    else if (result.isSpotify) setTheme("music");
    else if (result.isGitHub) setTheme("repo");
    else if (result.isCommerce) setTheme("commerce");
  }

  async function load(rawUrl: string | undefined) {
    const cleanUrl = (rawUrl || "").trim();
    if (!cleanUrl) {
      setError("No link was provided");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLinkPreview(cleanUrl);
      setPreview(result);
      applyPreviewDetails(result);
      addHistoryItem(result);
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Unable to generate story preview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(typeof urlParam === "string" ? urlParam : urlParam?.[0]);
    getAvailableTargets().then(setAvailable).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleShare(target: ShareTargetId) {
    if (!preview || sharingTarget) return;
    setSharingTarget(target);
    setError(null);
    try {
      await shareToTarget(cardRef, target, `${preview.title}\n${preview.url}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sharing failed");
    } finally {
      setSharingTarget(null);
    }
  }

  function selectTool(id: ToolId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTool((cur) => (cur === id ? null : id));
  }

  function toggleEditing() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTool(null);
    setEditing((v) => !v);
  }

  const sceneImage = backgroundImage?.uri || preview?.image || null;

  const originalImageSize = useImageSize(preview?.image);
  const sceneImageSize = backgroundImage || {
    width: originalImageSize.width,
    height: originalImageSize.height,
  };

  async function pickBackgroundImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setBackgroundImage({ uri: asset.uri, width: asset.width, height: asset.height });
      setBgMode("image");
      setEyedropperActive(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open the photo library");
    }
  }

  async function sampleImageColor(
    locationX: number,
    locationY: number,
    frameWidth: number,
    frameHeight: number,
  ) {
    if (!sceneImage || frameWidth <= 0 || frameHeight <= 0 || samplingColor) return;
    setSamplingColor(true);
    try {
      const sourceSize = backgroundImage || await new Promise<{
        uri: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        Image.getSize(
          sceneImage,
          (width, height) => resolve({ uri: sceneImage, width, height }),
          reject,
        );
      });
      const imageRatio = sourceSize.width / sourceSize.height;
      const frameRatio = frameWidth / frameHeight;
      let renderedWidth = frameWidth;
      let renderedHeight = frameHeight;
      let offsetX = 0;
      let offsetY = 0;
      if (imageRatio > frameRatio) {
        renderedHeight = frameWidth / imageRatio;
        offsetY = (frameHeight - renderedHeight) / 2;
      } else {
        renderedWidth = frameHeight * imageRatio;
        offsetX = (frameWidth - renderedWidth) / 2;
      }
      if (
        locationX < offsetX || locationX > offsetX + renderedWidth ||
        locationY < offsetY || locationY > offsetY + renderedHeight
      ) return;
      const originX = Math.min(
        sourceSize.width - 1,
        Math.max(0, Math.floor((locationX - offsetX) / renderedWidth * sourceSize.width)),
      );
      const originY = Math.min(
        sourceSize.height - 1,
        Math.max(0, Math.floor((locationY - offsetY) / renderedHeight * sourceSize.height)),
      );
      const crop = await ImageManipulator.manipulateAsync(
        sceneImage,
        [{ crop: { originX, originY, width: 1, height: 1 } }],
        { base64: true, format: ImageManipulator.SaveFormat.PNG },
      );
      if (!crop.base64) return;
      const binary = globalThis.atob(crop.base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const png = PNG.sync.read(bytes);
      const hex = `#${[png.data[0], png.data[1], png.data[2]]
        .map((channel: number) => channel.toString(16).padStart(2, "0"))
        .join("")}`.toUpperCase();
      applyCustomColor(hex);
      setBgMode("color");
      setEyedropperActive(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sample that color");
    } finally {
      setSamplingColor(false);
    }
  }

  const customHex = hsvToHex(customHsv.h, customHsv.s, customHsv.v);

  function applyCustomColor(raw: string): boolean {
    const hsv = hexToHsv(raw);
    if (!hsv) return false;
    const hex = hsvToHex(hsv.h, hsv.s, hsv.v);
    setCustomHsv(hsv);
    setBgColor(hex);
    setHexText(hex);
    return true;
  }

  const svResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          if (svSize.w <= 0 || svSize.h <= 0) return;
          const s = Math.min(1, Math.max(0, e.nativeEvent.locationX / svSize.w));
          const v =
            1 - Math.min(1, Math.max(0, e.nativeEvent.locationY / svSize.h));
          const hex = hsvToHex(customHsv.h, s, v);
          setCustomHsv({ h: customHsv.h, s, v });
          setBgColor(hex);
          setHexText(hex);
        },
        onPanResponderMove: (e) => {
          if (svSize.w <= 0 || svSize.h <= 0) return;
          const s = Math.min(1, Math.max(0, e.nativeEvent.locationX / svSize.w));
          const v =
            1 - Math.min(1, Math.max(0, e.nativeEvent.locationY / svSize.h));
          const hex = hsvToHex(customHsv.h, s, v);
          setCustomHsv({ h: customHsv.h, s, v });
          setBgColor(hex);
          setHexText(hex);
        },
      }),
    [svSize, customHsv.h],
  );

  const hueResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          if (hueWidth <= 0) return;
          const h =
            Math.min(1, Math.max(0, e.nativeEvent.locationX / hueWidth)) * 360;
          const hex = hsvToHex(h, customHsv.s, customHsv.v);
          setCustomHsv({ h, s: customHsv.s, v: customHsv.v });
          setBgColor(hex);
          setHexText(hex);
        },
        onPanResponderMove: (e) => {
          if (hueWidth <= 0) return;
          const h =
            Math.min(1, Math.max(0, e.nativeEvent.locationX / hueWidth)) * 360;
          const hex = hsvToHex(h, customHsv.s, customHsv.v);
          setCustomHsv({ h, s: customHsv.s, v: customHsv.v });
          setBgColor(hex);
          setHexText(hex);
        },
      }),
    [hueWidth, customHsv.s, customHsv.v],
  );

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
      <SafeAreaView
        edges={["top"]}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 190 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="w-full max-w-lg self-center flex-1"
        >
          {/* Top Navigation Bar */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className={`p-2.5 rounded-full border ${
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
            {preview && !loading ? (
              <Pressable
                onPress={toggleEditing}
                hitSlop={8}
                accessibilityLabel={editing ? "Done editing" : "Edit card"}
                className={`p-2.5 rounded-full border ${
                  editing
                    ? "bg-emerald-500 border-emerald-500 active:opacity-80"
                    : isDarkMode
                      ? "bg-zinc-900 border-zinc-800 active:bg-zinc-800"
                      : "bg-white border-zinc-200 active:bg-zinc-100"
                }`}
              >
                {editing ? (
                  <X size={16} color="#ffffff" strokeWidth={2.2} />
                ) : (
                  <PenLine
                    size={16}
                    color={isDarkMode ? "#e4e4e7" : "#3f3f46"}
                    strokeWidth={2.2}
                  />
                )}
              </Pressable>
            ) : null}
          </View>

          {/* Error Message */}
          {error && !loading ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
              <Text className="text-red-500 text-xs font-medium text-center">
                {error}
              </Text>
              <Pressable
                onPress={() =>
                  load(typeof urlParam === "string" ? urlParam : urlParam?.[0])
                }
                className="mt-3 self-center px-5 py-2 rounded-full bg-red-500 active:opacity-80"
              >
                <Text className="text-white text-xs font-bold">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Preview / Skeleton */}
          <View className="items-center justify-center my-2">
            {loading ? (
              <SkeletonCard isDark={isDarkMode} />
            ) : preview ? (
              <LinkCardView
                ref={cardRef}
                preview={preview}
                theme={theme}
                aspectRatio="story"
                safeMode
                bgMode={bgMode}
                bgColor={bgColor}
                backgroundImage={sceneImage}
                blurRadius={blurStrength}
                vignette={vignetteStrength / 100}
                author={author}
                readMinutes={readMinutes}
                dateText={dateText}
                location={location}
                handle={tweetHandle}
                verified={tweetVerified}
                likes={tweetLikes}
                replies={tweetReplies}
                avatarUrl={tweetAvatar}
                youtubeKind={ytKind}
                duration={ytDuration}
                views={ytViews}
                watching={ytWatching}
                subreddit={postSubreddit}
                score={postScore}
                price={cPrice}
                mrp={cMrp}
                rating={cRating}
                seller={cSeller}
                streamKind={streamKind}
                game={streamGame}
                viewers={streamViewers}
              />
            ) : null}
          </View>
        </ScrollView>

        {preview && !loading ? (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: insets.bottom + 12,
              maxWidth: 512,
              alignSelf: "center",
            }}
          >
              {/* Editor sheet: panel grows out of the toolbar as one unit */}
              {editing ? (
              <View
                style={{
                  borderRadius: 24,
                  backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#3F3F46" : "#E4E4E7",
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDarkMode ? 0.3 : 0.14,
                  shadowRadius: 18,
                  elevation: 8,
                  overflow: "hidden",
                }}
              >
              <View>
              {activeTool ? (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 12,
                    backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF",
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? "#3F3F46" : "#E4E4E7",
                  }}
                >
                  <ScrollView
                    style={{ maxHeight: Math.min(activeTool === "bg" ? 430 : 300, windowHeight * 0.48) }}
                    contentContainerStyle={{ paddingBottom: activeTool === "bg" ? 18 : 2 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                  {/* Theme Style */}
                  {activeTool === "theme" ? (
                    <View className="gap-2">
                      <View className="flex-row items-center gap-1.5">
                        <Layers size={14} color="#71717a" />
                        <Text className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                          Theme Style
                        </Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                      >
                        {(
                          [
                            "editorial",
                            "spotlight",
                            "tweet",
                            "youtube",
                            "clip",
                            "post",
                            "music",
                            "repo",
                            "commerce",
                            "stream",
                          ] as CardTheme[]
                        ).map((t) => {
                          const isActive = theme === t;
                          return (
                            <Pressable
                              key={t}
                              onPress={() => setTheme(t)}
                              className={`px-4 py-2 rounded-full border ${
                                isActive
                                  ? "bg-emerald-500/20 border-emerald-500"
                                  : "bg-gray-100 border-zinc-200"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold capitalize ${
                                  isActive ? "text-emerald-500" : "text-zinc-600"
                                }`}
                              >
                                {t}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  ) : null}
                  {/* Scene Background */}
                {activeTool === "bg" ? (
                  <View className="gap-2">
                    <View className="flex-row items-center gap-1.5">
                      <Palette
                        size={14}
                        color="#71717a"
                      />
                      <Text
                        className={`text-xs font-bold tracking-wider uppercase ${
                          "text-zinc-500"
                        }`}
                      >
                        Background
                      </Text>
                    </View>
                    <View
                      className={`flex-row p-1 rounded-xl ${
                        "bg-gray-100"
                      }`}
                    >
                      <Pressable
                        onPress={() => setBgMode("image")}
                        className={`flex-1 py-2.5 flex-row items-center justify-center gap-1.5 rounded-lg ${
                          bgMode === "image" ? "bg-emerald-500" : "bg-transparent"
                        }`}
                      >
                        <ImageIcon
                          size={14}
                          color={
                            bgMode === "image"
                              ? "#ffffff"
                            : "#71717a"
                          }
                        />
                        <Text
                          className={`text-xs font-bold ${
                            bgMode === "image"
                              ? "text-white"
                              : "text-zinc-600"
                          }`}
                        >
                          Image
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setBgMode("color")}
                        className={`flex-1 py-2.5 flex-row items-center justify-center gap-1.5 rounded-lg ${
                          bgMode === "color" ? "bg-emerald-500" : "bg-transparent"
                        }`}
                      >
                        <Palette
                          size={14}
                          color={
                            bgMode === "color"
                              ? "#ffffff"
                            : "#71717a"
                          }
                        />
                        <Text
                          className={`text-xs font-bold ${
                            bgMode === "color"
                              ? "text-white"
                              : "text-zinc-600"
                          }`}
                        >
                          Solid Color
                        </Text>
                      </Pressable>
                    </View>

                    {bgMode === "image" ? (
                      <View className="gap-2">
                        <Text className="text-sm font-semibold text-zinc-700">
                          Current image
                        </Text>
                        <View
                          onLayout={(event) => setBackgroundPreviewWidth(event.nativeEvent.layout.width)}
                          className="rounded-2xl overflow-hidden border border-zinc-200 bg-gray-100"
                          style={{
                            height: sceneImageSize.width > 0 && sceneImageSize.height > 0 && backgroundPreviewWidth > 0
                              ? Math.min(260, Math.max(112, backgroundPreviewWidth * sceneImageSize.height / sceneImageSize.width))
                              : 112,
                          }}
                        >
                          {sceneImage ? (
                            <Image
                              source={{ uri: sceneImage }}
                              resizeMode="contain"
                              style={{ width: "100%", height: "100%" }}
                            />
                          ) : (
                            <View className="flex-1 items-center justify-center gap-2">
                              <ImageIcon size={22} color="#A1A1AA" />
                              <Text className="text-xs font-semibold text-zinc-400">
                                No image found for this link
                              </Text>
                            </View>
                          )}
                          <Pressable
                            onPress={pickBackgroundImage}
                            className="absolute right-2 bottom-2 px-3 py-2 rounded-full bg-white/95 border border-zinc-200 active:opacity-80"
                          >
                            <Text className="text-xs font-bold text-zinc-800">
                              Change
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View className="gap-3">
                      {sceneImage ? (
                        <View className="gap-2">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-zinc-700">Pick from image</Text>
                            <Pressable
                              onPress={() => setEyedropperActive((active) => !active)}
                              className={`px-3 py-2 rounded-full border flex-row items-center gap-1.5 ${
                                eyedropperActive
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "bg-gray-100 border-zinc-200"
                              }`}
                            >
                              <Pipette size={14} color={eyedropperActive ? "#ffffff" : "#52525b"} />
                              <Text className={`text-xs font-bold ${eyedropperActive ? "text-white" : "text-zinc-700"}`}>
                                {eyedropperActive ? "Tap image" : "Eyedropper"}
                              </Text>
                            </Pressable>
                          </View>
                          {eyedropperActive ? (
                            <Pressable
                              disabled={samplingColor}
                              onPress={(event) => {
                                const { locationX, locationY } = event.nativeEvent;
                                sampleImageColor(locationX, locationY, eyedropperSize.width, eyedropperSize.height);
                              }}
                              onLayout={(event) => setEyedropperSize({
                                width: event.nativeEvent.layout.width,
                                height: event.nativeEvent.layout.height,
                              })}
                              className="h-[180px] rounded-2xl overflow-hidden border-2 border-emerald-500 bg-zinc-100"
                            >
                              <Image source={{ uri: sceneImage }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
                              {samplingColor ? (
                                <View className="absolute inset-0 items-center justify-center bg-black/20">
                                  <ActivityIndicator color="#ffffff" />
                                </View>
                              ) : null}
                            </Pressable>
                          ) : null}
                        </View>
                      ) : null}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                      >
                        {BG_PRESETS.map((preset) => {
                          const isActive =
                            bgColor.toLowerCase() === preset.value.toLowerCase();
                          return (
                            <Pressable
                              key={preset.value}
                              onPress={() => applyCustomColor(preset.value)}
                              accessibilityLabel={preset.label}
                              className={`w-12 h-12 rounded-2xl border-2 items-center justify-center ${
                                isActive
                                  ? "border-emerald-500"
                                  : "border-zinc-300"
                              }`}
                              style={{ backgroundColor: preset.value }}
                            >
                              {isActive ? (
                                <Check size={16} color="#ffffff" strokeWidth={3} />
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                      {/* Custom color: any color via hex, saturation square, or hue slider */}
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm font-semibold text-zinc-700">
                            Pick color
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <View
                              className="w-8 h-8 rounded-full border border-zinc-300"
                              style={{ backgroundColor: bgColor }}
                            />
                            <TextInput
                              value={hexText}
                              onChangeText={setHexText}
                              onSubmitEditing={() => {
                                if (!applyCustomColor(hexText)) setHexText(bgColor);
                              }}
                              placeholder="#0B0B12"
                              placeholderTextColor="#a1a1aa"
                              autoCapitalize="none"
                              autoCorrect={false}
                              className="w-28 border rounded-xl px-3 h-10 text-sm font-medium bg-gray-100 border-zinc-200 text-zinc-900"
                            />
                          </View>
                        </View>
                      <View
                        onLayout={(e) =>
                          setSvSize({
                            w: e.nativeEvent.layout.width,
                            h: e.nativeEvent.layout.height,
                          })
                        }
                        {...svResponder.panHandlers}
                        style={{
                          height: 148,
                          borderRadius: 12,
                          overflow: "hidden",
                          backgroundColor: `hsl(${customHsv.h}, 100%, 50%)`,
                        }}
                      >
                        <LinearGradient
                          colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }}
                        />
                        <LinearGradient
                          colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }}
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: `${customHsv.s * 100}%`,
                            top: `${(1 - customHsv.v) * 100}%`,
                            width: 22,
                            height: 22,
                            marginLeft: -11,
                            marginTop: -11,
                            borderRadius: 11,
                            backgroundColor: customHex,
                            borderWidth: 3,
                            borderColor: "#FFFFFF",
                            shadowColor: "#000000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 3,
                          }}
                        />
                      </View>
                      <View
                        onLayout={(e) => setHueWidth(e.nativeEvent.layout.width)}
                        {...hueResponder.panHandlers}
                        style={{ height: 28, borderRadius: 999, overflow: "hidden" }}
                      >
                        <LinearGradient
                          colors={[
                            "#ff0000",
                            "#ffff00",
                            "#00ff00",
                            "#00ffff",
                            "#0000ff",
                            "#ff00ff",
                            "#ff0000",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }}
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: `${(customHsv.h / 360) * 100}%`,
                            top: "50%",
                            width: 22,
                            height: 22,
                            marginLeft: -11,
                            marginTop: -11,
                            borderRadius: 11,
                            backgroundColor: customHex,
                            borderWidth: 3,
                            borderColor: "#FFFFFF",
                            shadowColor: "#000000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 3,
                          }}
                        />
                      </View>
                      </View>
                    </View>
                    )}
                  </View>
                ) : null}
                {activeTool === "blur" ? (
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Droplets size={14} color="#71717a" />
                        <Text className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                          Blur strength
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-emerald-500">{blurStrength}</Text>
                    </View>
                    <ValueSlider value={blurStrength} maximumValue={24} step={1} onChange={setBlurStrength} />
                  </View>
                ) : null}
                {activeTool === "vignette" ? (
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <CircleDot size={14} color="#71717a" />
                        <Text className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                          Vignette
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-emerald-500">{vignetteStrength}%</Text>
                    </View>
                    <ValueSlider value={vignetteStrength} maximumValue={100} step={1} onChange={setVignetteStrength} />
                  </View>
                ) : null}
                {/* Card Details (author / read time / date / location) */}
                {activeTool === "details" ? (
                  <View className="gap-2">
                    <View className="flex-row items-center gap-1.5">
                      <PenLine
                        size={14}
                        color="#71717a"
                      />
                      <Text
                        className={`text-xs font-bold tracking-wider uppercase ${
                          "text-zinc-500"
                        }`}
                      >
                        Card Details
                      </Text>
                    </View>
                    <View className="gap-2">
                      {(
                        theme === "tweet"
                          ? [
                              {
                                key: "author",
                                value: author,
                                setter: setAuthor,
                                placeholder: "Display name (e.g. Theo - t3.gg)",
                                keyboard: "default" as const,
                              },
                              {
                                key: "handle",
                                value: tweetHandle,
                                setter: setTweetHandle,
                                placeholder: "Handle without @ (e.g. theo)",
                                keyboard: "default" as const,
                              },
                              {
                                key: "dateText",
                                value: dateText,
                                setter: setDateText,
                                placeholder: "Time (e.g. 2:45 AM · Sep 11, 2026)",
                                keyboard: "default" as const,
                              },
                              {
                                key: "likes",
                                value: tweetLikes,
                                setter: setTweetLikes,
                                placeholder: "Likes (e.g. 550)",
                                keyboard: "numeric" as const,
                              },
                              {
                                key: "replies",
                                value: tweetReplies,
                                setter: setTweetReplies,
                                placeholder: "Replies (e.g. 25)",
                                keyboard: "numeric" as const,
                              },
                              {
                                key: "avatar",
                                value: tweetAvatar,
                                setter: setTweetAvatar,
                                placeholder: "Avatar image URL (optional)",
                                keyboard: "url" as const,
                              },
                            ]
                          : theme === "youtube"
                            ? [
                                {
                                  key: "author",
                                  value: author,
                                  setter: setAuthor,
                                  placeholder: "Channel (e.g. Fireship)",
                                  keyboard: "default" as const,
                                },
                                {
                                  key: "duration",
                                  value: ytDuration,
                                  setter: setYtDuration,
                                  placeholder: "Duration secs or m:ss (e.g. 754)",
                                  keyboard: "default" as const,
                                },
                                {
                                  key: "views",
                                  value: ytViews,
                                  setter: setYtViews,
                                  placeholder: "Views (e.g. 1.2M)",
                                  keyboard: "default" as const,
                                },
                                {
                                  key: "watching",
                                  value: ytWatching,
                                  setter: setYtWatching,
                                  placeholder:
                                    "Live watching or premiere date (optional)",
                                  keyboard: "default" as const,
                                },
                              ]
                            : theme === "clip"
                              ? [
                                  {
                                    key: "author",
                                    value: author,
                                    setter: setAuthor,
                                    placeholder: "Creator (e.g. Scout & Suki)",
                                    keyboard: "default" as const,
                                  },
                                  {
                                    key: "handle",
                                    value: tweetHandle,
                                    setter: setTweetHandle,
                                    placeholder: "Handle without @ (e.g. scout2015)",
                                    keyboard: "default" as const,
                                  },
                                  {
                                    key: "likes",
                                    value: tweetLikes,
                                    setter: setTweetLikes,
                                    placeholder: "Likes (e.g. 12.5K)",
                                    keyboard: "default" as const,
                                  },
                                  {
                                    key: "replies",
                                    value: tweetReplies,
                                    setter: setTweetReplies,
                                    placeholder: "Comments (e.g. 340)",
                                    keyboard: "default" as const,
                                  },
                                ]
                              : theme === "post"
                                ? [
                                    {
                                      key: "subreddit",
                                      value: postSubreddit,
                                      setter: setPostSubreddit,
                                      placeholder: "Subreddit without r/ (e.g. pics)",
                                      keyboard: "default" as const,
                                    },
                                    {
                                      key: "score",
                                      value: postScore,
                                      setter: setPostScore,
                                      placeholder: "Score / upvotes (e.g. 1234)",
                                      keyboard: "default" as const,
                                    },
                                    {
                                      key: "replies",
                                      value: tweetReplies,
                                      setter: setTweetReplies,
                                      placeholder: "Comments (e.g. 56)",
                                      keyboard: "default" as const,
                                    },
                                    {
                                      key: "author",
                                      value: author,
                                      setter: setAuthor,
                                      placeholder: "Author u/ (e.g. user1)",
                                      keyboard: "default" as const,
                                    },
                                  ]
                                : theme === "music"
                                  ? [
                                      {
                                        key: "author",
                                        value: author,
                                        setter: setAuthor,
                                        placeholder: "Artist (e.g. The Weeknd)",
                                        keyboard: "default" as const,
                                      },
                                    ]
                                  : theme === "commerce"
                                    ? [
                                        {
                                          key: "price",
                                          value: cPrice,
                                          setter: setCPrice,
                                          placeholder: "Price with symbol (e.g. ₹1,299)",
                                          keyboard: "default" as const,
                                        },
                                        {
                                          key: "mrp",
                                          value: cMrp,
                                          setter: setCMrp,
                                          placeholder: "MRP with symbol (optional)",
                                          keyboard: "default" as const,
                                        },
                                        {
                                          key: "rating",
                                          value: cRating,
                                          setter: setCRating,
                                          placeholder: "Rating 0-5 (e.g. 4.3)",
                                          keyboard: "decimal-pad" as const,
                                        },
                                        {
                                          key: "seller",
                                          value: cSeller,
                                          setter: setCSeller,
                                          placeholder: "Seller (e.g. RetailNet)",
                                          keyboard: "default" as const,
                                        },
                                      ]
                                    : theme === "stream"
                                      ? [
                                          {
                                            key: "author",
                                            value: author,
                                            setter: setAuthor,
                                            placeholder: "Streamer (e.g. Shroud)",
                                            keyboard: "default" as const,
                                          },
                                          {
                                            key: "game",
                                            value: streamGame,
                                            setter: setStreamGame,
                                            placeholder: "Game / category (e.g. Valorant)",
                                            keyboard: "default" as const,
                                          },
                                          {
                                            key: "viewers",
                                            value: streamViewers,
                                            setter: setStreamViewers,
                                            placeholder: "Viewers (e.g. 23.4K)",
                                            keyboard: "default" as const,
                                          },
                                          {
                                            key: "avatar",
                                            value: tweetAvatar,
                                            setter: setTweetAvatar,
                                            placeholder: "Profile image URL (optional)",
                                            keyboard: "url" as const,
                                          },
                                        ]
                                      : theme === "repo"
                                        ? []
                                        : [
                                            {
                                              key: "author",
                                              value: author,
                                              setter: setAuthor,
                                              placeholder: "Author (e.g. Technical Bot)",
                                              keyboard: "default" as const,
                                            },
                                            {
                                              key: "readMinutes",
                                              value: readMinutes,
                                              setter: setReadMinutes,
                                              placeholder: "Read time mins (e.g. 2)",
                                              keyboard: "numeric" as const,
                                            },
                                            {
                                              key: "dateText",
                                              value: dateText,
                                              setter: setDateText,
                                              placeholder: "Date (e.g. Aug 27, 2026)",
                                              keyboard: "default" as const,
                                            },
                                            {
                                              key: "location",
                                              value: location,
                                              setter: setLocation,
                                              placeholder: "Pill / brand (e.g. Georgia)",
                                              keyboard: "default" as const,
                                            },
                                          ]
                      ).map((field) => (
                        <TextInput
                          key={field.key}
                          value={field.value}
                          onChangeText={field.setter}
                          placeholder={field.placeholder}
                          placeholderTextColor="#a1a1aa"
                          keyboardType={field.keyboard}
                          className={`border rounded-xl px-3.5 h-11 text-sm font-medium ${
                            "bg-gray-100 border-zinc-200 text-zinc-900"
                          }`}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      ))}
                      {theme === "tweet" ? (
                        <Pressable
                          onPress={() => setTweetVerified(!tweetVerified)}
                          className={`flex-row items-center justify-between border rounded-xl px-3.5 h-11 ${
                            "bg-gray-100 border-zinc-200"
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              "text-zinc-700"
                            }`}
                          >
                            Verified badge
                          </Text>
                          <View
                            className={`px-3 py-1 rounded-full ${
                              tweetVerified ? "bg-emerald-500" : "bg-zinc-500/30"
                            }`}
                          >
                            <Text className="text-white text-xs font-bold">
                              {tweetVerified ? "On" : "Off"}
                            </Text>
                          </View>
                        </Pressable>
                      ) : null}
                      {theme === "youtube" ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 8 }}
                        >
                          {(
                            [
                              { value: "", label: "Auto" },
                              { value: "video", label: "Video" },
                              { value: "short", label: "Short" },
                              { value: "live", label: "Live" },
                              { value: "premiere", label: "Premiere" },
                            ] as { value: YouTubeKind | ""; label: string }[]
                          ).map((k) => {
                            const isActive = ytKind === k.value;
                            return (
                              <Pressable
                                key={k.label}
                                onPress={() => setYtKind(k.value)}
                                className={`px-4 py-2 rounded-full border ${
                                  isActive
                                    ? "bg-emerald-500/20 border-emerald-500"
                                    : "bg-gray-100 border-zinc-200"
                                }`}
                              >
                                <Text
                                  className={`text-xs font-semibold ${
                                    isActive
                                      ? "text-emerald-500"
                                      : "text-zinc-600"
                                  }`}
                                >
                                  {k.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      ) : null}
                      {theme === "stream" ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 8 }}
                        >
                          {(
                            [
                              { value: "", label: "Auto" },
                              { value: "live", label: "Live" },
                              { value: "clip", label: "Clip" },
                              { value: "video", label: "VOD" },
                              { value: "channel", label: "Channel" },
                            ] as { value: TwitchKind | ""; label: string }[]
                          ).map((k) => {
                            const isActive = streamKind === k.value;
                            return (
                              <Pressable
                                key={k.label}
                                onPress={() => setStreamKind(k.value)}
                                className={`px-4 py-2 rounded-full border ${
                                  isActive
                                    ? "bg-emerald-500/20 border-emerald-500"
                                    : "bg-gray-100 border-zinc-200"
                                }`}
                              >
                                <Text
                                  className={`text-xs font-semibold ${
                                    isActive
                                      ? "text-emerald-500"
                                      : "text-zinc-600"
                                  }`}
                                >
                                  {k.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      ) : null}
                    </View>
                  </View>
                ) : null}
                  </ScrollView>
                </View>
              ) : null}

              {/* Bottom editor toolbar */}
              <View
                className="flex-row items-center px-2 py-2"
                style={{ backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF" }}
              >
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <Pressable
                      key={tool.id}
                      onPress={() => selectTool(tool.id)}
                      className="flex-1 min-h-14 items-center justify-center gap-1 rounded-2xl active:opacity-80"
                      style={
                        isActive
                          ? { backgroundColor: isDarkMode ? "rgba(16,185,129,0.22)" : "rgba(16,185,129,0.16)" }
                          : undefined
                      }
                    >
                      <Icon
                        size={20}
                        color={isActive ? "#10b981" : isDarkMode ? "#d4d4d8" : "#52525b"}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: isActive ? "#10b981" : isDarkMode ? "#a1a1aa" : "#71717a",
                        }}
                      >
                        {tool.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              </View>
              </View>
              ) : null}

              {/* Share row (edit mode hides it) */}
              {!editing ? (
                <View className="flex-row justify-between gap-2 mt-1">
                  {SHARE_TARGETS.filter((t) => available[t.id]).map((t) => {
                    const busy = sharingTarget === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => handleShare(t.id)}
                        disabled={sharingTarget !== null}
                        className="flex-1 items-center gap-1.5 py-1"
                      >
                        <View
                          className={`w-11 h-11 rounded-full items-center justify-center ${
                            sharingTarget !== null && !busy ? "opacity-40" : ""
                          }`}
                          style={{ backgroundColor: t.color }}
                        >
                          {busy ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                          ) : (
                            <TargetIcon target={t.id} color={t.color} />
                          )}
                        </View>
                        <Text
                          className={`text-[11px] font-bold ${
                            isDarkMode ? "text-zinc-300" : "text-zinc-600"
                          }`}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
      </SafeAreaView>
    </View>
  );
}
