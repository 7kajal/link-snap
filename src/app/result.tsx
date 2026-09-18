import { Buffer } from "buffer";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  CircleDot,
  Contrast,
  Download,
  Droplets,
  GalleryHorizontal,
  Image as ImageIcon,
  Layers,
  Palette,
  PenLine,
  Pipette,
  Share2,
  X,
} from "lucide-react-native";
import { PNG } from "pngjs/browser";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated as RNAnimated,
  Easing,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import LinkCardView, {
  type CardBackgroundMode,
  type CardColorScheme,
  type CardImageFit,
  type CardTheme,
} from "@/components/link-card-view";
import { SkeletonCard } from "@/components/skeleton-card";
import { useAppAppearance } from "@/contexts/appearance-context";
import { addHistoryItem } from "@/lib/history";
import {
  fetchLinkPreview,
  type LinkPreview,
  type TwitchKind,
  type YouTubeKind,
} from "@/lib/link-preview";
import { hexToHsv, hsvToHex } from "@/lib/palette";
import { displayToSource, readTilePixel, rgbaToHex } from "@/lib/pixel-sampler";
import {
  getAvailableWhatsAppVariants,
  getAvailableTargets,
  SHARE_TARGETS,
  shareToTarget,
  type ShareTargetId,
  type WhatsAppVariant,
} from "@/lib/share-targets";
import { useImageSize } from "@/lib/use-image-size";

const BRAND_PATHS: Record<"instagram" | "facebook" | "whatsapp", string> = {
  instagram:
    "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
};

function BrandIcon({ name }: { name: keyof typeof BRAND_PATHS }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#ffffff">
      <Path d={BRAND_PATHS[name]} />
    </Svg>
  );
}

function TargetIcon({ target }: { target: ShareTargetId }) {
  if (target === "instagram") return <BrandIcon name="instagram" />;
  if (target === "whatsapp") return <BrandIcon name="whatsapp" />;
  if (target === "facebook") return <BrandIcon name="facebook" />;
  if (target === "save")
    return <Download size={18} color="#ffffff" strokeWidth={2.2} />;
  return <Share2 size={18} color="#ffffff" strokeWidth={2.2} />;
}

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

type ToolId =
  | "theme"
  | "bg"
  | "details"
  | "blur"
  | "vignette"
  | "appearance"
  | "fit";
type CardAppearance = "auto" | CardColorScheme;
type PresetCategoryId =
  | "custom"
  | "blog"
  | "social"
  | "jobs"
  | "entertainment"
  | "podcasts"
  | "gaming"
  | "books"
  | "shopping"
  | "food"
  | "travel"
  | "launch"
  | "developer";

type PresetCategory = {
  id: PresetCategoryId;
  label: string;
  themes: CardTheme[];
};

const PRESET_NAMES: Record<CardTheme, string> = {
  editorial: "Editorial",
  spotlight: "Spotlight",
  tweet: "X Post",
  youtube: "YouTube",
  clip: "TikTok",
  post: "Reddit",
  music: "Spotify",
  repo: "GitHub",
  commerce: "Product",
  stream: "Twitch",
  linkedin: "LinkedIn",
  indeed: "Job",
  zomato: "Zomato",
  swiggy: "Swiggy",
  pinterest: "Pinterest",
  app: "App Store",
  stay: "Stay",
  game: "Game",
  book: "Book",
  launch: "Launch",
  ytmusic: "YouTube Music",
  jiosaavn: "JioSaavn",
  gaana: "Gaana",
  applemusic: "Apple Music",
  netflix: "Netflix",
  primevideo: "Prime Video",
  hotstar: "Hotstar",
  kukufm: "Kuku FM",
  applepodcasts: "Apple Podcasts",
  pocketfm: "Pocket FM",
  kindle: "Kindle",
  wattpad: "Wattpad",
  pratilipi: "Pratilipi",
  webtoon: "Webtoon",
  medium: "Medium",
  amazon: "Amazon",
  meesho: "Meesho",
  flipkart: "Flipkart",
};

const PRESET_CATEGORIES: PresetCategory[] = [
  { id: "custom", label: "Custom", themes: ["editorial", "spotlight"] },
  { id: "blog", label: "Blog", themes: ["editorial", "spotlight", "post", "medium"] },
  { id: "social", label: "Social", themes: ["tweet", "post", "linkedin", "pinterest"] },
  { id: "jobs", label: "Jobs", themes: ["indeed", "linkedin"] },
  {
    id: "entertainment",
    label: "Entertainment",
    themes: ["youtube", "ytmusic", "netflix", "primevideo", "hotstar", "clip", "stream", "music", "jiosaavn", "gaana", "applemusic"],
  },
  { id: "podcasts", label: "Podcasts", themes: ["kukufm", "applepodcasts", "pocketfm"] },
  { id: "gaming", label: "Gaming", themes: ["game"] },
  { id: "books", label: "Book & Comics", themes: ["book", "kindle", "wattpad", "pratilipi", "webtoon"] },
  { id: "shopping", label: "Shopping", themes: ["commerce", "app", "amazon", "meesho", "flipkart"] },
  { id: "food", label: "Food", themes: ["zomato", "swiggy"] },
  { id: "travel", label: "Travel", themes: ["stay"] },
  { id: "launch", label: "Launch", themes: ["launch"] },
  { id: "developer", label: "Developer", themes: ["repo", "app"] },
];

type ThemeField = {
  key: string;
  value: string;
  setter: (value: string) => void;
  placeholder: string;
  keyboard: "default" | "numeric" | "decimal-pad" | "url";
};

const TOOLS: { id: ToolId; label: string; icon: typeof Layers }[] = [
  { id: "theme", label: "Presets", icon: Layers },
  { id: "details", label: "Edit", icon: PenLine },
  { id: "bg", label: "BG", icon: Palette },
  { id: "blur", label: "Blur", icon: Droplets },
  { id: "vignette", label: "Vignette", icon: CircleDot },
  { id: "appearance", label: "Theme", icon: Contrast },
  { id: "fit", label: "Fit", icon: GalleryHorizontal },
];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MemoLinkCardView = memo(LinkCardView);

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
  const widthSV = useSharedValue(0);
  const pos = useSharedValue(0);
  const last = useSharedValue(-1);

  const fillStyle = useAnimatedStyle(() => ({ width: pos.value }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value - 11 }],
  }));

  const applyX = useCallback(
    (x: number) => {
      "worklet";
      const w = widthSV.value;
      if (w <= 0) return;
      const raw = Math.max(0, Math.min(1, x / w)) * maximumValue;
      const next = Math.round(raw / step) * step;
      // eslint-disable-next-line react-hooks/immutability
      pos.value = (next / maximumValue) * w;
      if (next !== last.value) {
        // eslint-disable-next-line react-hooks/immutability
        last.value = next;
        runOnJS(onChange)(next);
      }
    },
    [maximumValue, step, onChange, widthSV, pos, last],
  );

  const gesture = useMemo(
    () =>
      Gesture.Race(
        Gesture.Tap()
          .maxDistance(12)
          .onEnd((event) => applyX(event.x)),
        Gesture.Pan()
          .activeOffsetX([-10, 10])
          .failOffsetY([-12, 12])
          .onUpdate((event) => applyX(event.x)),
      ),
    [applyX],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View
        onLayout={(event) => {
          const w = event.nativeEvent.layout.width;
          // eslint-disable-next-line react-hooks/immutability
          widthSV.value = w;
          // eslint-disable-next-line react-hooks/immutability
          pos.value = (value / maximumValue) * w;
        }}
        style={{ height: 36, justifyContent: "center" }}
      >
        <View
          style={{ height: 6, borderRadius: 999, backgroundColor: "#E4E4E7" }}
        >
          <Animated.View
            style={{
              height: 6,
              borderRadius: 999,
              backgroundColor: "#10B981",
              ...fillStyle,
            }}
          />
        </View>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: 7,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#FFFFFF",
              borderWidth: 3,
              borderColor: "#10B981",
              elevation: 2,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { url: urlParam } = useLocalSearchParams<{ url?: string }>();
  const { isDarkMode } = useAppAppearance();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const cardRef = useRef<View>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingTarget, setSharingTarget] = useState<ShareTargetId | null>(
    null,
  );
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [editing, setEditing] = useState(false);
  const [available, setAvailable] = useState<Record<ShareTargetId, boolean>>({
    instagram: false,
    whatsapp: false,
    facebook: false,
    save: true,
    more: true,
  });

  // Customization States
  const [theme, setTheme] = useState<CardTheme>("editorial");
  const [presetCategory, setPresetCategory] =
    useState<PresetCategoryId | null>(null);
  const [presetPagerWidth, setPresetPagerWidth] = useState(0);
  const [presetPagerProgress] = useState(() => new RNAnimated.Value(0));
  const [cardAppearance, setCardAppearance] = useState<CardAppearance>("auto");
  const [imageFit, setImageFit] = useState<CardImageFit>("cover");
  const [bgMode, setBgMode] = useState<CardBackgroundMode>("image");
  const [bgColor, setBgColor] = useState("#0B0B12");
  const [backgroundImage, setBackgroundImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [backgroundPreviewWidth, setBackgroundPreviewWidth] = useState(0);
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [cardFrame, setCardFrame] = useState({ w: 0, h: 0 });
  const [shareRowHeight, setShareRowHeight] = useState(0);
  const [editorSheetHeight, setEditorSheetHeight] = useState(0);
  const toolbarScrollRef = useRef<ScrollView>(null);
  const [toolbarScrollX, setToolbarScrollX] = useState(0);
  const [toolbarViewportWidth, setToolbarViewportWidth] = useState(0);
  const [toolbarContentWidth, setToolbarContentWidth] = useState(0);
  const [blurStrength, setBlurStrength] = useState(8);
  const [vignetteStrength, setVignetteStrength] = useState(0);
  const [customHsv, setCustomHsv] = useState({ h: 240, s: 0.39, v: 0.07 });
  const [hexText, setHexText] = useState("#0B0B12");

  const detectedPresetCategory = useMemo<PresetCategoryId>(() => {
    if (!preview) return "custom";
    if (preview.isCommerce || preview.isApp) return "shopping";
    if (preview.isGame) return "gaming";
    if (preview.isZomato || preview.isSwiggy) return "food";
    if (
      preview.isYouTube ||
      preview.isYouTubeMusic ||
      preview.isTikTok ||
      preview.isTwitch ||
      preview.isSpotify ||
      preview.isJioSaavn ||
      preview.isGaana ||
      preview.isAppleMusic ||
      preview.isNetflix ||
      preview.isPrimeVideo ||
      preview.isHotstar
    )
      return "entertainment";
    if (preview.isKukuFm || preview.isApplePodcasts || preview.isPocketFm)
      return "podcasts";
    if (preview.isTweet || preview.isReddit || preview.isPinterest) return "social";
    if (preview.isLinkedIn || preview.isIndeed) return "jobs";
    if (preview.isGitHub) return "developer";
    if (preview.isLaunch) return "launch";
    if (preview.isStay) return "travel";
    if (
      preview.isBook ||
      preview.isKindle ||
      preview.isWattpad ||
      preview.isPratilipi ||
      preview.isWebtoon
    )
      return "books";
    if (preview.isMedium) return "blog";
    return "custom";
  }, [preview]);

  const orderedPresetCategories = useMemo(() => {
    const detected = PRESET_CATEGORIES.find(
      (category) => category.id === detectedPresetCategory,
    );
    return detected
      ? [detected, ...PRESET_CATEGORIES.filter((category) => category.id !== detected.id)]
      : PRESET_CATEGORIES;
  }, [detectedPresetCategory]);

  useEffect(() => {
    RNAnimated.timing(presetPagerProgress, {
      toValue: presetCategory === null ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [presetCategory, presetPagerProgress]);

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
  const [tweetViews, setTweetViews] = useState("");

  // Clip (TikTok) extras
  const [clipViews, setClipViews] = useState("");

  // Reddit extras
  const [postViews, setPostViews] = useState("");

  // Show/hide all engagement counts on the card
  const [showCounts, setShowCounts] = useState(true);
  // Show/hide the "N min read" label on blog/reading cards
  const [showReadTime, setShowReadTime] = useState(true);

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

  // LinkedIn extras
  const [liHeadline, setLiHeadline] = useState("");
  const [liReposts, setLiReposts] = useState("");

  // Indeed extras
  const [jobSalary, setJobSalary] = useState("");
  const [jobType, setJobType] = useState("");

  // Restaurant extras (Zomato/Swiggy)
  const [cuisine, setCuisine] = useState("");
  const [eta, setEta] = useState("");

  // App Store / Play Store extras
  const [appCategory, setAppCategory] = useState("");
  const [appDownloads, setAppDownloads] = useState("");

  // Airbnb / stay listing extras
  const [stayHost, setStayHost] = useState("");

  // Steam game extras
  const [gameGenre, setGameGenre] = useState("");
  const [gameRelease, setGameRelease] = useState("");

  // Book extras
  const [bookPages, setBookPages] = useState("");

  // Product Hunt launch extras
  const [launchTagline, setLaunchTagline] = useState("");
  const [launchUpvotes, setLaunchUpvotes] = useState("");

  function applyPreviewDetails(result: LinkPreview) {
    // Pre-fill editable details from parsed metadata (user can tweak)
    setAuthor(result.author || "");
    setReadMinutes(result.readingMinutes ? String(result.readingMinutes) : "");
    setDateText("");
    setLocation(
      result.jobLocation ||
        result.area ||
        (result.isTweet || result.isYouTube ? "" : result.siteName || ""),
    );
    setTweetHandle(result.handle || "");
    setTweetVerified(result.verified);
    setTweetLikes(result.likeCount != null ? String(result.likeCount) : "");
    setTweetReplies(result.replyCount != null ? String(result.replyCount) : "");
    setTweetAvatar(result.avatar || "");
    setTweetViews(result.viewCount != null ? String(result.viewCount) : "");
    setYtKind("");
    setYtDuration(result.durationSec != null ? String(result.durationSec) : "");
    setYtViews(result.viewCount != null ? String(result.viewCount) : "");
    setYtWatching(
      result.concurrentViewers != null ? String(result.concurrentViewers) : "",
    );
    setPostSubreddit(result.subreddit || "");
    setPostScore(result.postScore != null ? String(result.postScore) : "");
    setPostViews(result.viewCount != null ? String(result.viewCount) : "");
    setClipViews(result.viewCount != null ? String(result.viewCount) : "");
    setCPrice(result.commercePrice || "");
    setCMrp(result.commerceMrp || "");
    setCRating(
      result.commerceRating != null ? String(result.commerceRating) : "",
    );
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
    setLiHeadline(result.headline || "");
    setLiReposts(result.repostCount != null ? String(result.repostCount) : "");
    setJobSalary(result.salary || "");
    setJobType(result.jobType || "");
    setCuisine(result.cuisine || "");
    setEta(result.eta || "");
    setAppCategory(result.category || "");
    setAppDownloads(result.downloads || "");
    setStayHost(result.hostName || "");
    setGameGenre(result.genre || "");
    setGameRelease(result.releaseDate || "");
    setBookPages(result.pages != null ? String(result.pages) : "");
    setLaunchTagline(result.tagline || "");
    setLaunchUpvotes(result.upvotes != null ? String(result.upvotes) : "");
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
    else if (result.isLinkedIn) setTheme("linkedin");
    else if (result.isIndeed) setTheme("indeed");
    else if (result.isZomato) setTheme("zomato");
    else if (result.isSwiggy) setTheme("swiggy");
    else if (result.isPinterest) setTheme("pinterest");
    else if (result.isApp) setTheme("app");
    else if (result.isStay) setTheme("stay");
    else if (result.isGame) setTheme("game");
    else if (result.isBook) setTheme("book");
    else if (result.isLaunch) setTheme("launch");
    else if (result.isCommerce) {
      if (result.commerceStore === "amazon" || result.commerceStore === "meesho" || result.commerceStore === "flipkart") {
        setTheme(result.commerceStore);
      } else {
        setTheme("commerce");
      }
    }
    else if (result.isMedium) setTheme("medium");
  }

  function themeFields(t: CardTheme): ThemeField[] {
    if (t === "tweet") {
      return [
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
          key: "views",
          value: tweetViews,
          setter: setTweetViews,
          placeholder: "Views (e.g. 12.5K)",
          keyboard: "default" as const,
        },
        {
          key: "avatar",
          value: tweetAvatar,
          setter: setTweetAvatar,
          placeholder: "Avatar image URL (optional)",
          keyboard: "url" as const,
        },
      ];
    }
    if (t === "youtube") {
      return [
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
          placeholder: "Live watching or premiere date (optional)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "clip") {
      return [
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
        {
          key: "views",
          value: clipViews,
          setter: setClipViews,
          placeholder: "Views / plays (e.g. 1.2M)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "post") {
      return [
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
          key: "views",
          value: postViews,
          setter: setPostViews,
          placeholder: "Views (e.g. 45K)",
          keyboard: "default" as const,
        },
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Author u/ (e.g. user1)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "music") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Artist (e.g. The Weeknd)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "commerce" || t === "amazon" || t === "meesho" || t === "flipkart") {
      return [
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
      ];
    }
    if (t === "stream") {
      return [
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
      ];
    }
    if (t === "linkedin") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Name (e.g. Theo Browne)",
          keyboard: "default" as const,
        },
        {
          key: "headline",
          value: liHeadline,
          setter: setLiHeadline,
          placeholder: "Headline / role (e.g. Staff Engineer at Vercel)",
          keyboard: "default" as const,
        },
        {
          key: "reposts",
          value: liReposts,
          setter: setLiReposts,
          placeholder: "Reposts (e.g. 320)",
          keyboard: "numeric" as const,
        },
        {
          key: "dateText",
          value: dateText,
          setter: setDateText,
          placeholder: "Date (e.g. Aug 27, 2026)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "indeed") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Company (e.g. Google)",
          keyboard: "default" as const,
        },
        {
          key: "salary",
          value: jobSalary,
          setter: setJobSalary,
          placeholder: "Salary (e.g. ₹20L-30L a year)",
          keyboard: "default" as const,
        },
        {
          key: "jobType",
          value: jobType,
          setter: setJobType,
          placeholder: "Job type (e.g. Full-time)",
          keyboard: "default" as const,
        },
        {
          key: "location",
          value: location,
          setter: setLocation,
          placeholder: "Location (e.g. Bengaluru, India)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "zomato" || t === "swiggy") {
      return [
        {
          key: "cuisine",
          value: cuisine,
          setter: setCuisine,
          placeholder: "Cuisine (e.g. North Indian, Chinese)",
          keyboard: "default" as const,
        },
        {
          key: "eta",
          value: eta,
          setter: setEta,
          placeholder: "Delivery ETA (e.g. 25-30 min)",
          keyboard: "default" as const,
        },
        {
          key: "location",
          value: location,
          setter: setLocation,
          placeholder: "Area (e.g. Indiranagar)",
          keyboard: "default" as const,
        },
        {
          key: "price",
          value: cPrice,
          setter: setCPrice,
          placeholder: "Price for two (e.g. ₹500)",
          keyboard: "default" as const,
        },
        {
          key: "rating",
          value: cRating,
          setter: setCRating,
          placeholder: "Rating 0-5 (e.g. 4.3)",
          keyboard: "decimal-pad" as const,
        },
      ];
    }
    if (t === "pinterest") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Creator / board (e.g. Minimalist Living)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "app") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Developer (e.g. Spotify AB)",
          keyboard: "default" as const,
        },
        {
          key: "category",
          value: appCategory,
          setter: setAppCategory,
          placeholder: "Category (e.g. Music)",
          keyboard: "default" as const,
        },
        {
          key: "downloads",
          value: appDownloads,
          setter: setAppDownloads,
          placeholder: "Downloads (e.g. 1B+)",
          keyboard: "default" as const,
        },
        {
          key: "price",
          value: cPrice,
          setter: setCPrice,
          placeholder: "Price (e.g. 0 or $4.99)",
          keyboard: "default" as const,
        },
        {
          key: "rating",
          value: cRating,
          setter: setCRating,
          placeholder: "Rating 0-5 (e.g. 4.8)",
          keyboard: "decimal-pad" as const,
        },
      ];
    }
    if (t === "stay") {
      return [
        {
          key: "host",
          value: stayHost,
          setter: setStayHost,
          placeholder: "Host (e.g. Superhouse)",
          keyboard: "default" as const,
        },
        {
          key: "location",
          value: location,
          setter: setLocation,
          placeholder: "Neighbourhood (e.g. Santorini)",
          keyboard: "default" as const,
        },
        {
          key: "price",
          value: cPrice,
          setter: setCPrice,
          placeholder: "Nightly price (e.g. ₹8,500)",
          keyboard: "default" as const,
        },
        {
          key: "rating",
          value: cRating,
          setter: setCRating,
          placeholder: "Rating 0-5 (e.g. 4.9)",
          keyboard: "decimal-pad" as const,
        },
      ];
    }
    if (t === "game") {
      return [
        {
          key: "genre",
          value: gameGenre,
          setter: setGameGenre,
          placeholder: "Genres (e.g. Action, Adventure)",
          keyboard: "default" as const,
        },
        {
          key: "releaseDate",
          value: gameRelease,
          setter: setGameRelease,
          placeholder: "Release date (e.g. Feb 4, 2022)",
          keyboard: "default" as const,
        },
        {
          key: "price",
          value: cPrice,
          setter: setCPrice,
          placeholder: "Price (e.g. ₹1,999)",
          keyboard: "default" as const,
        },
        {
          key: "rating",
          value: cRating,
          setter: setCRating,
          placeholder: "Metacritic 0-100 (e.g. 94)",
          keyboard: "numeric" as const,
        },
      ];
    }
    if (t === "book") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Author (e.g. J.R.R. Tolkien)",
          keyboard: "default" as const,
        },
        {
          key: "bookPages",
          value: bookPages,
          setter: setBookPages,
          placeholder: "Pages (e.g. 423)",
          keyboard: "numeric" as const,
        },
        {
          key: "rating",
          value: cRating,
          setter: setCRating,
          placeholder: "Rating 0-5 (e.g. 4.5)",
          keyboard: "decimal-pad" as const,
        },
      ];
    }
    if (t === "launch") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Maker (e.g. Brian Lovin)",
          keyboard: "default" as const,
        },
        {
          key: "tagline",
          value: launchTagline,
          setter: setLaunchTagline,
          placeholder: "Tagline (e.g. The lego kit for AI agents)",
          keyboard: "default" as const,
        },
        {
          key: "upvotes",
          value: launchUpvotes,
          setter: setLaunchUpvotes,
          placeholder: "Upvotes (e.g. 620)",
          keyboard: "numeric" as const,
        },
      ];
    }
    if (t === "ytmusic" || t === "jiosaavn" || t === "gaana" || t === "applemusic") {
      return [
        {
          key: "artist",
          value: author,
          setter: setAuthor,
          placeholder: "Artist (e.g. Arijit Singh)",
          keyboard: "default" as const,
        },
        {
          key: "kind",
          value: spKindLabel,
          setter: setSpKindLabel,
          placeholder: "Kind (e.g. Song / Album)",
          keyboard: "default" as const,
        },
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Author (e.g. Vikram Sampath)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "netflix" || t === "primevideo" || t === "hotstar") {
      return [
        {
          key: "tagline",
          value: excerpt,
          setter: setExcerpt,
          placeholder: "Tagline (e.g. Stranger Things)",
          keyboard: "default" as const,
        },
        {
          key: "meta",
          value: pill,
          setter: setPill,
          placeholder: "Meta (e.g. 2016 · 12+)",
          keyboard: "default" as const,
        },
      ];
    }
    if (t === "kindle" || t === "wattpad" || t === "pratilipi" || t === "webtoon") {
      return [
        {
          key: "author",
          value: author,
          setter: setAuthor,
          placeholder: "Author (e.g. J.K. Rowling)",
          keyboard: "default" as const,
        },
        {
          key: "pages",
          value: bookPages,
          setter: setBookPages,
          placeholder: "Pages (e.g. 530)",
          keyboard: "numeric" as const,
        },
        {
          key: "rating",
          value: cRating,
          setter: setCRating,
          placeholder: "Rating (e.g. 4.5)",
          keyboard: "decimal-pad" as const,
        },
      ];
    }
    if (t === "repo") return [];
    return [
      {
        key: "author",
        value: author,
        setter: setAuthor,
        placeholder: "Author (e.g. XYZ)",
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
    ];
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
      setError(
        e instanceof Error ? e.message : "Unable to generate story preview",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(typeof urlParam === "string" ? urlParam : urlParam?.[0]);
    getAvailableTargets()
      .then(setAvailable)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function performShare(
    target: ShareTargetId,
    whatsAppVariant?: WhatsAppVariant,
  ) {
    if (!preview || sharingTarget) return;
    setSharingTarget(target);
    setError(null);
    try {
      await shareToTarget(
        cardRef,
        target,
        `${preview.title}\n${preview.url}`,
        whatsAppVariant,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sharing failed");
    } finally {
      setSharingTarget(null);
    }
  }

  async function handleShare(target: ShareTargetId) {
    if (target !== "whatsapp" || Platform.OS !== "android") {
      await performShare(target);
      return;
    }

    const variants = await getAvailableWhatsAppVariants();
    if (variants.length < 2) {
      await performShare(target, variants[0] ?? "personal");
      return;
    }

    Alert.alert("Share with", "Choose a WhatsApp app", [
      { text: "Cancel", style: "cancel" },
      { text: "WhatsApp", onPress: () => void performShare(target, "personal") },
      {
        text: "WhatsApp Business",
        onPress: () => void performShare(target, "business"),
      },
    ]);
  }

  function selectTool(id: ToolId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (id === "theme" && activeTool !== "theme") setPresetCategory(null);
    setActiveTool((cur) => (cur === id ? null : id));
  }

  const toolbarScrollRange = Math.max(
    0,
    toolbarContentWidth - toolbarViewportWidth,
  );
  const toolbarTrackWidth = toolbarViewportWidth;
  const toolbarThumbWidth =
    toolbarContentWidth > 0
      ? Math.max(
          36,
          Math.min(
            toolbarTrackWidth,
            toolbarTrackWidth * (toolbarViewportWidth / toolbarContentWidth),
          ),
        )
      : toolbarTrackWidth;
  const toolbarThumbX =
    toolbarScrollRange > 0
      ? (Math.min(toolbarScrollX, toolbarScrollRange) / toolbarScrollRange) *
        (toolbarTrackWidth - toolbarThumbWidth)
      : 0;

  function toggleEditing() {
    if (eyedropperActive) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTool(null);
    setEditing((v) => !v);
  }

  function openEyedropper() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    sourceSizeRef.current = null;
    tileRef.current = null;
    tileGenRef.current = 0;
    dragActiveRef.current = false;
    setDragActive(false);
    previewLast.value = "";
    setActiveTool(null);
    setEditing(false);
    setEyedropperActive(true);
  }

  function closeEyedropper() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEyedropperActive(false);
    setActiveTool("bg");
    setEditing(true);
  }

  const previewImage = preview?.imageFallback || preview?.image || null;
  const sceneImage = backgroundImage?.uri || previewImage;

  // Story card is 9:16 → shrink its width so it never slides under the pinned
  // bottom bar on small screens.
  const CARD_TOP_RESERVE = 90;
  const CARD_BOTTOM_MARGIN = 16;
  const SHARE_ROW_MIN_HEIGHT = 72;
  const containerWidth = Math.min(windowWidth - 40, 512);
  const bottomControlsHeight = editing
    ? editorSheetHeight || 88
    : shareRowHeight || SHARE_ROW_MIN_HEIGHT;
  const cardBottomReserve = shareRowHeight || SHARE_ROW_MIN_HEIGHT;
  const maxCardHeight = Math.max(
    280,
    windowHeight -
      insets.top -
      insets.bottom -
      CARD_TOP_RESERVE -
      cardBottomReserve -
      CARD_BOTTOM_MARGIN,
  );
  const cardWidth = Math.min(containerWidth, maxCardHeight * (9 / 16));

  const cardPreviewProps = {
    preview,
    imageFit,
    colorScheme:
      cardAppearance === "auto"
        ? isDarkMode
          ? ("dark" as const)
          : ("light" as const)
        : cardAppearance,
    aspectRatio: "story" as const,
    safeMode: true,
    bgMode,
    bgColor,
    backgroundImage: sceneImage,
    blurRadius: blurStrength,
    vignette: vignetteStrength / 100,
    hideCounts: !showCounts,
    hideReadTime: !showReadTime,
    author,
    readMinutes,
    dateText,
    location,
    handle: tweetHandle,
    verified: tweetVerified,
    likes: tweetLikes,
    replies: tweetReplies,
    avatarUrl: tweetAvatar,
    youtubeKind: ytKind,
    duration: ytDuration,
    watching: ytWatching,
    subreddit: postSubreddit,
    score: postScore,
    price: cPrice,
    mrp: cMrp,
    rating: cRating,
    seller: cSeller,
    streamKind,
    game: streamGame,
    viewers: streamViewers,
    headline: liHeadline,
    reposts: liReposts,
    salary: jobSalary,
    jobType,
    cuisine,
    eta,
    category: appCategory,
    downloads: appDownloads,
    host: stayHost,
    genre: gameGenre,
    releaseDate: gameRelease,
    pages: bookPages,
    tagline: launchTagline,
    upvotes: launchUpvotes,
  };

  const originalImageSize = useImageSize(previewImage);
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
      setBackgroundImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
      setBgMode("image");
      setEyedropperActive(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to open the photo library",
      );
    }
  }

  // ---- Eyedropper: tile-based pixel sampler (pure JS reads while dragging) ----
  type Tile = {
    buf: Uint8Array;
    ox: number;
    oy: number;
    tw: number;
    th: number;
  };
  const sourceSizeRef = useRef<{ width: number; height: number } | null>(null);
  const tileRef = useRef<{
    buf: Uint8Array;
    ox: number;
    oy: number;
    tw: number;
    th: number;
  } | null>(null);
  const tileGenRef = useRef(0);
  const tileBusyRef = useRef(false);
  const dragActiveRef = useRef(false);
  const [dragActive, setDragActive] = useState(false);
  const pickX = useSharedValue(0);
  const pickY = useSharedValue(0);
  const previewColor = useSharedValue("#FFFFFF");
  const previewLast = useSharedValue("");

  async function resolveSourceSize() {
    if (sourceSizeRef.current) return sourceSizeRef.current;
    if (!sceneImage) return null;
    const found = backgroundImage
      ? { width: backgroundImage.width, height: backgroundImage.height }
      : await new Promise<{ width: number; height: number } | null>(
          (resolve) => {
            Image.getSize(
              sceneImage,
              (width, height) => resolve({ width, height }),
              () => resolve(null),
            );
          },
        );
    if (found) sourceSizeRef.current = found;
    return found;
  }

  function samplePixelSync(x: number, y: number): string | null {
    const size = sourceSizeRef.current;
    const frame = cardFrame;
    if (!size || frame.w <= 0 || frame.h <= 0) return null;
    const { sourceX, sourceY } = displayToSource(
      x,
      y,
      frame.w,
      frame.h,
      size.width,
      size.height,
    );
    const tile = tileRef.current;
    if (!tile) return null;
    if (
      sourceX < tile.ox - 8 ||
      sourceX > tile.ox + tile.tw + 8 ||
      sourceY < tile.oy - 8 ||
      sourceY > tile.oy + tile.th + 8
    ) {
      queueTileLoad(sourceX, sourceY);
      return null;
    }
    const { r, g, b } = readTilePixel(
      tile.buf,
      tile.tw,
      tile.th,
      sourceX - tile.ox,
      sourceY - tile.oy,
    );
    return rgbaToHex(r, g, b);
  }

  function queueTileLoad(sourceX: number, sourceY: number) {
    if (!sceneImage || tileBusyRef.current) return;
    tileBusyRef.current = true;
    loadTileAt(sourceX, sourceY, ++tileGenRef.current);
  }

  async function loadTileAt(
    sourceX: number,
    sourceY: number,
    gen: number,
  ): Promise<Tile | null> {
    try {
      const size = await resolveSourceSize();
      if (!size) return tileRef.current;
      const tileSize = 224;
      const tw = Math.min(tileSize, size.width);
      const th = Math.min(tileSize, size.height);
      const ox = Math.max(
        0,
        Math.min(size.width - tw, Math.round(sourceX) - Math.floor(tw / 2)),
      );
      const oy = Math.max(
        0,
        Math.min(size.height - th, Math.round(sourceY) - Math.floor(th / 2)),
      );
      const crop = await ImageManipulator.manipulateAsync(
        sceneImage as string,
        [{ crop: { originX: ox, originY: oy, width: tw, height: th } }],
        { base64: true, format: ImageManipulator.SaveFormat.PNG },
      );
      if (!crop.base64 || gen !== tileGenRef.current) return tileRef.current;
      const png = PNG.sync.read(Buffer.from(crop.base64, "base64"));
      const tile: Tile = {
        buf: new Uint8Array(png.data),
        ox,
        oy,
        tw,
        th,
      };
      tileRef.current = tile;
      previewLast.value = "";
      refreshPreview();
      return tile;
    } catch {
      return tileRef.current;
    } finally {
      tileBusyRef.current = false;
    }
  }

  function refreshPreview() {
    if (!dragActiveRef.current) return;
    const hex = samplePixelSync(pickX.value, pickY.value);
    if (hex) {
      previewLast.value = hex;
      previewColor.value = hex;
    }
  }

  async function primeForPick(x: number, y: number) {
    const size = await resolveSourceSize();
    if (!size) return;
    const frame = cardFrame;
    if (frame.w <= 0 || frame.h <= 0) return;
    const { sourceX, sourceY } = displayToSource(
      x,
      y,
      frame.w,
      frame.h,
      size.width,
      size.height,
    );
    queueTileLoad(sourceX, sourceY);
  }

  function beginDrag(x: number, y: number) {
    dragActiveRef.current = true;
    setDragActive(true);
    pickX.value = x;
    pickY.value = y;
    primeForPick(x, y);
  }

  function dragSample(x: number, y: number) {
    const hex = samplePixelSync(x, y);
    if (hex) {
      previewLast.value = hex;
      previewColor.value = hex;
    }
  }

  function endDrag() {
    dragActiveRef.current = false;
    setDragActive(false);
    previewLast.value = "";
  }

  function applyDragEnd(x: number, y: number) {
    finalPick(x, y);
  }

  async function finalPick(x: number, y: number) {
    const size = await resolveSourceSize();
    const frame = cardFrame;
    if (!size || frame.w <= 0 || frame.h <= 0) return;
    const { sourceX, sourceY } = displayToSource(
      x,
      y,
      frame.w,
      frame.h,
      size.width,
      size.height,
    );
    let tile = tileRef.current;
    if (
      !tile ||
      sourceX < tile.ox ||
      sourceX >= tile.ox + tile.tw ||
      sourceY < tile.oy ||
      sourceY >= tile.oy + tile.th
    ) {
      if (tileBusyRef.current) {
        await new Promise((r) => setTimeout(r, 16));
      }
      tile = await loadTileAt(sourceX, sourceY, ++tileGenRef.current);
    }
    if (!tile) return;
    const { r, g, b } = readTilePixel(
      tile.buf,
      tile.tw,
      tile.th,
      sourceX - tile.ox,
      sourceY - tile.oy,
    );
    const hex = rgbaToHex(r, g, b);
    applyCustomColor(hex);
    setBgMode("color");
    setEyedropperActive(false);
    setActiveTool("bg");
    setEditing(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  const pickCircleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pickX.value - 22 },
      { translateY: pickY.value - 22 - 52 },
    ],
    backgroundColor: previewColor.value,
  }));

  const pickGesture = useMemo(
    () =>
      Gesture.Race(
        Gesture.Tap()
          .maxDistance(12)
          // eslint-disable-next-line react-hooks/refs
          .onEnd((event) => runOnJS(finalPick)(event.x, event.y)),
        Gesture.Pan()
          .activateAfterLongPress(110)
          // eslint-disable-next-line react-hooks/refs
          .onStart((event) => runOnJS(beginDrag)(event.x, event.y))
          // eslint-disable-next-line react-hooks/refs
          .onUpdate((event) => {
            // eslint-disable-next-line react-hooks/immutability
            pickX.value = event.x;
            // eslint-disable-next-line react-hooks/immutability
            pickY.value = event.y;
            runOnJS(dragSample)(event.x, event.y);
          })
          .onEnd(() => runOnJS(applyDragEnd)(pickX.value, pickY.value))
          // eslint-disable-next-line react-hooks/refs
          .onFinalize(() => runOnJS(endDrag)()),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eyedropperActive, sceneImage, cardFrame.w, cardFrame.h],
  );

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

  const svW = useSharedValue(0);
  const svH = useSharedValue(0);
  const sSV = useSharedValue(customHsv.s);
  const vSV = useSharedValue(customHsv.v);
  const hSV = useSharedValue(customHsv.h);
  const svLast = useSharedValue("");
  const hueW = useSharedValue(0);
  const hueLast = useSharedValue(-1);

  useEffect(() => {
    sSV.value = customHsv.s;
    vSV.value = customHsv.v;
    hSV.value = customHsv.h;
  }, [customHsv, sSV, vSV, hSV]);

  const onApplyColor = useCallback((h: number, s: number, v: number) => {
    const hex = hsvToHex(h, s, v);
    setCustomHsv({ h, s, v });
    setBgColor(hex);
    setHexText(hex);
  }, []);

  const applySV = useCallback(
    (x: number, y: number) => {
      "worklet";
      const w = svW.value;
      const h = svH.value;
      if (w <= 0 || h <= 0) return;
      const s = Math.min(1, Math.max(0, x / w));
      const v = Math.min(1, Math.max(0, 1 - y / h));
      // eslint-disable-next-line react-hooks/immutability
      sSV.value = s;
      // eslint-disable-next-line react-hooks/immutability
      vSV.value = v;
      const key = `${s.toFixed(3)}-${v.toFixed(3)}`;
      if (key !== svLast.value) {
        // eslint-disable-next-line react-hooks/immutability
        svLast.value = key;
        runOnJS(onApplyColor)(hSV.value, s, v);
      }
    },
    [svW, svH, sSV, vSV, hSV, svLast, onApplyColor],
  );

  const svThumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sSV.value * svW.value - 11 },
      { translateY: (1 - vSV.value) * svH.value - 11 },
    ],
  }));

  const svGesture = useMemo(
    () =>
      Gesture.Race(
        Gesture.Tap()
          .maxDistance(12)
          .onEnd((event) => applySV(event.x, event.y)),
        Gesture.Pan()
          .activateAfterLongPress(120)
          .onUpdate((event) => applySV(event.x, event.y)),
      ),
    [applySV],
  );

  const applyHue = useCallback(
    (x: number) => {
      "worklet";
      const w = hueW.value;
      if (w <= 0) return;
      const h = Math.min(1, Math.max(0, x / w)) * 360;
      // eslint-disable-next-line react-hooks/immutability
      hSV.value = h;
      if (Math.round(h) !== hueLast.value) {
        // eslint-disable-next-line react-hooks/immutability
        hueLast.value = Math.round(h);
        runOnJS(onApplyColor)(h, sSV.value, vSV.value);
      }
    },
    [hueW, hSV, hueLast, sSV, vSV, onApplyColor],
  );

  const hueThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (hSV.value / 360) * hueW.value - 11 }],
  }));

  const hueGesture = useMemo(
    () =>
      Gesture.Race(
        Gesture.Tap()
          .maxDistance(12)
          .onEnd((event) => applyHue(event.x)),
        Gesture.Pan()
          .activeOffsetX([-10, 10])
          .failOffsetY([-12, 12])
          .onUpdate((event) => applyHue(event.x)),
      ),
    [applyHue],
  );

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomControlsHeight + 28,
            minHeight: windowHeight - insets.top,
          }}
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
            {preview && !loading && !eyedropperActive ? (
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
          <View
            className="items-center justify-center my-2"
            style={{ minHeight: maxCardHeight }}
          >
            {loading ? (
              <SkeletonCard isDark={isDarkMode} style={{ width: cardWidth }} />
            ) : preview ? (
              <View
                style={{ width: cardWidth }}
                onLayout={(event) =>
                  setCardFrame({
                    w: event.nativeEvent.layout.width,
                    h: event.nativeEvent.layout.height,
                  })
                }
              >
                <MemoLinkCardView
                  ref={cardRef}
                  {...cardPreviewProps}
                  theme={theme}
                  views={
                    theme === "tweet"
                      ? tweetViews
                      : theme === "post"
                        ? postViews
                        : theme === "clip"
                          ? clipViews
                          : ytViews
                  }
                />
                {eyedropperActive && sceneImage ? (
                  <>
                    <GestureDetector gesture={pickGesture}>
                      <View className="absolute inset-0" />
                    </GestureDetector>
                    <View
                      pointerEvents="none"
                      className="absolute top-3 inset-x-0 px-4 flex-row items-center justify-start"
                    >
                      <View className="px-3 py-1.5 rounded-full bg-black/55">
                        <Text className="text-xs font-bold text-white">
                          Tap or hold and drag
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={closeEyedropper}
                      hitSlop={8}
                      className="absolute top-3 right-4 w-8 h-8 items-center justify-center rounded-full bg-black/55"
                    >
                      <X size={16} color="#ffffff" strokeWidth={2.4} />
                    </Pressable>
                    {dragActive ? (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          {
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            borderWidth: 3,
                            borderColor: "#FFFFFF",
                            shadowColor: "#000000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.35,
                            shadowRadius: 4,
                            elevation: 5,
                          },
                          pickCircleStyle,
                        ]}
                      />
                    ) : null}
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>

        {preview && !loading ? (
          <KeyboardAvoidingView
            behavior="position"
            pointerEvents="box-none"
            onLayout={(event) =>
              setEditorSheetHeight(event.nativeEvent.layout.height)
            }
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: insets.bottom + 12,
              maxWidth: 512,
              alignSelf: "center",
            }}
            contentContainerStyle={{ alignSelf: "stretch" }}
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
                  overflow: "visible",
                }}
              >
                <View style={{ borderRadius: 24, overflow: "hidden" }}>
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
                        style={{
                          maxHeight: Math.min(
                            activeTool === "bg" ? 430 : activeTool === "theme" ? 360 : 300,
                            windowHeight * 0.52,
                          ),
                        }}
                        contentContainerStyle={{
                          paddingBottom: activeTool === "bg" ? 18 : 2,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        {/* Preset browser */}
                        {activeTool === "theme" ? (
                          <View
                            style={{ height: presetCategory === null ? 292 : 244, overflow: "hidden" }}
                            onLayout={(event) =>
                              setPresetPagerWidth(event.nativeEvent.layout.width)
                            }
                          >
                            {presetPagerWidth > 0 ? (
                              <>
                              <RNAnimated.View
                                pointerEvents={presetCategory === null ? "auto" : "none"}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  transform: [
                                    {
                                      translateX: RNAnimated.multiply(
                                        presetPagerProgress,
                                        -presetPagerWidth,
                                      ),
                                    },
                                  ],
                                }}
                              >
                                <ScrollView
                                  showsVerticalScrollIndicator={false}
                                  contentContainerStyle={{ paddingBottom: 8 }}
                                >
                                  {orderedPresetCategories.map((category, index) => (
                                    <Pressable
                                      key={category.id}
                                      onPress={() => setPresetCategory(category.id)}
                                      className="min-h-[52px] flex-row items-center justify-between active:opacity-70"
                                      style={{
                                        borderBottomWidth:
                                          index === orderedPresetCategories.length - 1 ? 0 : 1,
                                        borderBottomColor: isDarkMode ? "#3F3F46" : "#E4E4E7",
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: "700",
                                          color: isDarkMode ? "#F4F4F5" : "#27272A",
                                        }}
                                      >
                                        {category.label}
                                      </Text>
                                      <View className="flex-row items-center gap-2">
                                        <Text className="text-xs font-semibold text-zinc-400">
                                          {category.themes.length}
                                        </Text>
                                        <ChevronRight size={18} color="#A1A1AA" />
                                      </View>
                                    </Pressable>
                                  ))}
                                </ScrollView>
                              </RNAnimated.View>
                              <RNAnimated.View
                                pointerEvents={presetCategory === null ? "none" : "auto"}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  transform: [
                                    {
                                      translateX: RNAnimated.add(
                                        presetPagerWidth,
                                        RNAnimated.multiply(
                                          presetPagerProgress,
                                          -presetPagerWidth,
                                        ),
                                      ),
                                    },
                                  ],
                                }}
                              >
                                <Pressable
                                  onPress={() => setPresetCategory(null)}
                                  className="h-10 flex-row items-center gap-2 active:opacity-70"
                                >
                                  <ArrowLeft size={18} color={isDarkMode ? "#E4E4E7" : "#3F3F46"} />
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: "700",
                                      color: isDarkMode ? "#F4F4F5" : "#27272A",
                                    }}
                                  >
                                    {PRESET_CATEGORIES.find(
                                      (category) => category.id === presetCategory,
                                    )?.label || "Presets"}
                                  </Text>
                                </Pressable>
                                <ScrollView
                                  horizontal
                                  showsHorizontalScrollIndicator={false}
                                  contentContainerStyle={{ gap: 12, paddingTop: 4, paddingBottom: 4 }}
                                >
                                  {(PRESET_CATEGORIES.find(
                                    (category) => category.id === presetCategory,
                                  )?.themes || []).map((presetTheme) => {
                                const isActive = theme === presetTheme;
                                const presetPreviewWidth = cardFrame.w || cardWidth;
                                const presetScale = 96 / presetPreviewWidth;
                                return (
                                  <Pressable
                                    key={presetTheme}
                                    onPress={() => setTheme(presetTheme)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isActive }}
                                    style={{ width: 96 }}
                                  >
                                    <View
                                      style={{
                                        width: 96,
                                        height: 96 * (16 / 9),
                                        borderRadius: 14,
                                        overflow: "hidden",
                                        borderWidth: isActive ? 3 : 1,
                                        borderColor: isActive
                                          ? "#10B981"
                                          : isDarkMode
                                            ? "#3F3F46"
                                            : "#D4D4D8",
                                        backgroundColor: "#0B0B12",
                                      }}
                                    >
                                      <View
                                        pointerEvents="none"
                                        style={{
                                          width: presetPreviewWidth,
                                          height: presetPreviewWidth * (16 / 9),
                                          transform: [{ scale: presetScale }],
                                          transformOrigin: [0, 0, 0],
                                        }}
                                      >
                                        <MemoLinkCardView
                                          {...cardPreviewProps}
                                          theme={presetTheme}
                                          views={
                                            presetTheme === "tweet"
                                              ? tweetViews
                                              : presetTheme === "post"
                                                ? postViews
                                                : presetTheme === "clip"
                                                  ? clipViews
                                                  : ytViews
                                          }
                                        />
                                      </View>
                                    </View>
                                    <Text
                                      numberOfLines={1}
                                      style={{
                                        marginTop: 7,
                                        fontSize: 12,
                                        fontWeight: isActive ? "800" : "600",
                                        color: isActive
                                          ? "#10B981"
                                          : isDarkMode
                                            ? "#D4D4D8"
                                            : "#52525B",
                                        textAlign: "center",
                                      }}
                                    >
                                      {PRESET_NAMES[presetTheme]}
                                    </Text>
                                  </Pressable>
                                );
                                  })}
                                </ScrollView>
                              </RNAnimated.View>
                              </>
                            ) : null}
                          </View>
                        ) : null}
                        {activeTool === "appearance" ? (
                          <View className="gap-2">
                            <View className="flex-row gap-2">
                              {(["auto", "light", "dark"] as CardAppearance[]).map(
                                (appearance) => {
                                  const isActive = cardAppearance === appearance;
                                  return (
                                    <Pressable
                                      key={appearance}
                                      onPress={() => setCardAppearance(appearance)}
                                      accessibilityRole="button"
                                      accessibilityState={{ selected: isActive }}
                                      className={`px-4 py-2 rounded-full border ${
                                        isActive
                                          ? "bg-emerald-500/20 border-emerald-500"
                                          : "bg-gray-100 border-zinc-200"
                                      }`}
                                    >
                                      <Text
                                        className={`text-xs font-semibold capitalize ${
                                          isActive
                                            ? "text-emerald-500"
                                            : "text-zinc-600"
                                        }`}
                                      >
                                        {appearance}
                                      </Text>
                                    </Pressable>
                                  );
                                },
                              )}
                            </View>
                          </View>
                        ) : null}
                        {activeTool === "fit" ? (
                          <View className="gap-2">
                            <View className="flex-row gap-2">
                              {(["cover", "contain"] as CardImageFit[]).map((fit) => {
                                const isActive = imageFit === fit;
                                return (
                                  <Pressable
                                    key={fit}
                                    onPress={() => setImageFit(fit)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isActive }}
                                    className={`px-4 py-2 rounded-full border ${
                                      isActive
                                        ? "bg-emerald-500/20 border-emerald-500"
                                        : "bg-gray-100 border-zinc-200"
                                    }`}
                                  >
                                    <Text
                                      className={`text-xs font-semibold capitalize ${
                                        isActive
                                          ? "text-emerald-500"
                                          : "text-zinc-600"
                                      }`}
                                    >
                                      {fit}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                            </View>
                          </View>
                        ) : null}
                        {/* Scene Background */}
                        {activeTool === "bg" ? (
                          <View className="gap-2">
                            <View
                              className={`flex-row p-1 rounded-xl ${"bg-gray-100"}`}
                            >
                              <Pressable
                                onPress={() => setBgMode("image")}
                                className={`flex-1 py-2.5 flex-row items-center justify-center gap-1.5 rounded-lg ${
                                  bgMode === "image"
                                    ? "bg-emerald-500"
                                    : "bg-transparent"
                                }`}
                              >
                                <ImageIcon
                                  size={14}
                                  color={
                                    bgMode === "image" ? "#ffffff" : "#71717a"
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
                                  bgMode === "color"
                                    ? "bg-emerald-500"
                                    : "bg-transparent"
                                }`}
                              >
                                <Palette
                                  size={14}
                                  color={
                                    bgMode === "color" ? "#ffffff" : "#71717a"
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
                                  onLayout={(event) =>
                                    setBackgroundPreviewWidth(
                                      event.nativeEvent.layout.width,
                                    )
                                  }
                                  className="rounded-2xl overflow-hidden border border-zinc-200 bg-gray-100"
                                  style={{
                                    height:
                                      sceneImageSize.width > 0 &&
                                      sceneImageSize.height > 0 &&
                                      backgroundPreviewWidth > 0
                                        ? Math.min(
                                            260,
                                            Math.max(
                                              112,
                                              (backgroundPreviewWidth *
                                                sceneImageSize.height) /
                                                sceneImageSize.width,
                                            ),
                                          )
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
                                <View className="gap-3">
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
                                            if (!applyCustomColor(hexText))
                                              setHexText(bgColor);
                                          }}
                                          placeholder="#0B0B12"
                                          placeholderTextColor="#a1a1aa"
                                          autoCapitalize="none"
                                          autoCorrect={false}
                                          className="w-28 border rounded-xl px-3 h-10 text-sm font-medium bg-gray-100 border-zinc-200 text-zinc-900"
                                        />
                                        {sceneImage ? (
                                          <Pressable
                                            onPress={() =>
                                              eyedropperActive
                                                ? closeEyedropper()
                                                : openEyedropper()
                                            }
                                            className={`p-2.5 h-10 rounded-xl border flex-row items-center justify-center ${
                                              eyedropperActive
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "bg-gray-100 border-zinc-200"
                                            }`}
                                          >
                                            <Pipette
                                              size={16}
                                              color={
                                                eyedropperActive
                                                  ? "#ffffff"
                                                  : "#52525b"
                                              }
                                            />
                                          </Pressable>
                                        ) : null}
                                      </View>
                                    </View>
                                    <GestureDetector gesture={svGesture}>
                                      <View
                                        onLayout={(e) => {
                                          // eslint-disable-next-line react-hooks/immutability
                                          svW.value =
                                            e.nativeEvent.layout.width;
                                          // eslint-disable-next-line react-hooks/immutability
                                          svH.value =
                                            e.nativeEvent.layout.height;
                                        }}
                                        style={{
                                          height: 148,
                                          borderRadius: 12,
                                          overflow: "hidden",
                                          backgroundColor: `hsl(${customHsv.h}, 100%, 50%)`,
                                        }}
                                      >
                                        <LinearGradient
                                          colors={[
                                            "rgba(255,255,255,1)",
                                            "rgba(255,255,255,0)",
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
                                        <LinearGradient
                                          colors={[
                                            "rgba(0,0,0,0)",
                                            "rgba(0,0,0,1)",
                                          ]}
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
                                        <Animated.View
                                          style={[
                                            {
                                              position: "absolute",
                                              left: 0,
                                              top: 0,
                                              width: 22,
                                              height: 22,
                                              borderRadius: 11,
                                              backgroundColor: customHex,
                                              borderWidth: 3,
                                              borderColor: "#FFFFFF",
                                              shadowColor: "#000000",
                                              shadowOffset: {
                                                width: 0,
                                                height: 1,
                                              },
                                              shadowOpacity: 0.3,
                                              shadowRadius: 2,
                                              elevation: 3,
                                            },
                                            svThumbStyle,
                                          ]}
                                        />
                                      </View>
                                    </GestureDetector>
                                    <GestureDetector gesture={hueGesture}>
                                      <View
                                        onLayout={(e) => {
                                          // eslint-disable-next-line react-hooks/immutability
                                          hueW.value =
                                            e.nativeEvent.layout.width;
                                        }}
                                        style={{
                                          height: 28,
                                          borderRadius: 999,
                                          overflow: "hidden",
                                        }}
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
                                        <Animated.View
                                          style={[
                                            {
                                              position: "absolute",
                                              left: 0,
                                              top: 3,
                                              width: 22,
                                              height: 22,
                                              borderRadius: 11,
                                              backgroundColor: customHex,
                                              borderWidth: 3,
                                              borderColor: "#FFFFFF",
                                              shadowColor: "#000000",
                                              shadowOffset: {
                                                width: 0,
                                                height: 1,
                                              },
                                              shadowOpacity: 0.3,
                                              shadowRadius: 2,
                                              elevation: 3,
                                            },
                                            hueThumbStyle,
                                          ]}
                                        />
                                      </View>
                                    </GestureDetector>
                                  </View>
                                </View>
                              </View>
                            )}
                          </View>
                        ) : null}
                        {activeTool === "blur" ? (
                          <View className="gap-2">
                            <View className="flex-row justify-end">
                              <Text className="text-sm font-bold text-emerald-500">
                                {blurStrength}
                              </Text>
                            </View>
                            <ValueSlider
                              value={blurStrength}
                              maximumValue={24}
                              step={1}
                              onChange={setBlurStrength}
                            />
                          </View>
                        ) : null}
                        {activeTool === "vignette" ? (
                          <View className="gap-2">
                            <View className="flex-row justify-end">
                              <Text className="text-sm font-bold text-emerald-500">
                                {vignetteStrength}%
                              </Text>
                            </View>
                            <ValueSlider
                              value={vignetteStrength}
                              maximumValue={100}
                              step={1}
                              onChange={setVignetteStrength}
                            />
                          </View>
                        ) : null}
                        {/* Card Details (author / read time / date / location) */}
                        {activeTool === "details" ? (
                          <View className="gap-2">
                            <View className="gap-2">
                              {themeFields(theme).map((field) => (
                                <TextInput
                                  key={field.key}
                                  value={field.value}
                                  onChangeText={field.setter}
                                  placeholder={field.placeholder}
                                  placeholderTextColor="#a1a1aa"
                                  keyboardType={field.keyboard}
                                  className={`border rounded-xl px-3.5 h-11 text-sm font-medium ${"bg-gray-100 border-zinc-200 text-zinc-900"}`}
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                />
                              ))}
                              {[
                                "clip",
                                "tweet",
                                "post",
                                "youtube",
                                "stream",
                                "linkedin",
                              ].includes(theme) ? (
                                <Pressable
                                  onPress={() => setShowCounts(!showCounts)}
                                  className={`flex-row items-center justify-between border rounded-xl px-3.5 h-11 ${"bg-gray-100 border-zinc-200"}`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${"text-zinc-700"}`}
                                  >
                                    View & like counts
                                  </Text>
                                  <View
                                    className={`px-3 py-1 rounded-full ${
                                      showCounts
                                        ? "bg-emerald-500"
                                        : "bg-zinc-500/30"
                                    }`}
                                  >
                                    <Text className="text-white text-xs font-bold">
                                      {showCounts ? "On" : "Off"}
                                    </Text>
                                  </View>
                                </Pressable>
                              ) : null}
                              {["editorial", "spotlight", "medium"].includes(
                                theme,
                              ) ? (
                                <Pressable
                                  onPress={() => setShowReadTime(!showReadTime)}
                                  className={`flex-row items-center justify-between border rounded-xl px-3.5 h-11 ${"bg-gray-100 border-zinc-200"}`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${"text-zinc-700"}`}
                                  >
                                    Read time
                                  </Text>
                                  <View
                                    className={`px-3 py-1 rounded-full ${
                                      showReadTime
                                        ? "bg-emerald-500"
                                        : "bg-zinc-500/30"
                                    }`}
                                  >
                                    <Text className="text-white text-xs font-bold">
                                      {showReadTime ? "On" : "Off"}
                                    </Text>
                                  </View>
                                </Pressable>
                              ) : null}
                              {theme === "tweet" ? (
                                <Pressable
                                  onPress={() =>
                                    setTweetVerified(!tweetVerified)
                                  }
                                  className={`flex-row items-center justify-between border rounded-xl px-3.5 h-11 ${"bg-gray-100 border-zinc-200"}`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${"text-zinc-700"}`}
                                  >
                                    Verified badge
                                  </Text>
                                  <View
                                    className={`px-3 py-1 rounded-full ${
                                      tweetVerified
                                        ? "bg-emerald-500"
                                        : "bg-zinc-500/30"
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
                                    ] as {
                                      value: YouTubeKind | "";
                                      label: string;
                                    }[]
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
                                    ] as {
                                      value: TwitchKind | "";
                                      label: string;
                                    }[]
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
                    style={{
                      backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF",
                      overflow: "visible",
                    }}
                  >
                    <ScrollView
                      ref={toolbarScrollRef}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      scrollEventThrottle={16}
                      onLayout={(event) =>
                        setToolbarViewportWidth(event.nativeEvent.layout.width)
                      }
                      onContentSizeChange={(width) => setToolbarContentWidth(width)}
                      onScroll={(event) =>
                        setToolbarScrollX(event.nativeEvent.contentOffset.x)
                      }
                      contentContainerStyle={{
                        alignItems: "center",
                        paddingHorizontal: 8,
                        paddingTop: 8,
                        paddingBottom: 5,
                        gap: 4,
                      }}
                    >
                      {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activeTool === tool.id;
                        return (
                          <Pressable
                            key={tool.id}
                            onPress={() => selectTool(tool.id)}
                            className="min-h-14 min-w-16 items-center justify-center gap-1 rounded-2xl active:opacity-80"
                            style={
                              isActive
                                ? {
                                    backgroundColor: isDarkMode
                                      ? "rgba(16,185,129,0.22)"
                                      : "rgba(16,185,129,0.16)",
                                  }
                                : undefined
                            }
                          >
                            <Icon
                              size={20}
                              color={
                                isActive
                                  ? "#10b981"
                                  : isDarkMode
                                    ? "#d4d4d8"
                                    : "#52525b"
                              }
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: isActive
                                  ? "#10b981"
                                  : isDarkMode
                                    ? "#a1a1aa"
                                    : "#71717a",
                              }}
                            >
                              {tool.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                    {toolbarScrollRange > 0 ? (
                      <View
                        style={{
                          height: 3,
                          borderRadius: 999,
                          overflow: "hidden",
                          backgroundColor: isDarkMode ? "#3F3F46" : "#E4E4E7",
                        }}
                      >
                        <View
                          style={{
                            width: toolbarThumbWidth,
                            height: 3,
                            borderRadius: 999,
                            backgroundColor: "#10B981",
                            transform: [{ translateX: toolbarThumbX }],
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}

            {/* Share row (edit mode hides it) */}
            {!editing ? (
              <View
                onLayout={(e) => setShareRowHeight(e.nativeEvent.layout.height)}
                className="flex-row justify-between gap-2 mt-1"
              >
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
                          <TargetIcon target={t.id} />
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
          </KeyboardAvoidingView>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
