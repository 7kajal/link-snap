import { createContext, forwardRef, useContext, useState, type ReactNode } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
} from "react-native";
import {
  ArrowBigUp,
  AudioLines,
  AudioWaveform,
  BookMarked,
  BookOpen,
  Building2,
  Check,
  Clock,
  Disc,
  Download,
  Eye,
  Film,
  GitFork,
  Headphones,
  Heart,
  MapPin,
  MessageCircle,
  MicVocal,
  MonitorPlay,
  Music,
  Play,
  Radio,
  Repeat2,
  Scroll,
  Sparkles,
  Star,
  ThumbsUp,
  Tv,
} from "lucide-react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { domainFromUrl, getPalette, type Palette } from "@/lib/palette";
import { SCENE_SCALE } from "@/lib/pixel-sampler";
import { useImageSize } from "@/lib/use-image-size";
import {
  commerceStoreFromUrl,
  formatCompact,
  formatDateLabel,
  formatDuration,
  youtubeKindFromUrl,
  type CommerceStore,
  type LinkPreview,
  type SpotifyKind,
  type TwitchKind,
  type YouTubeKind,
} from "@/lib/link-preview";

export type CardTheme = "tweet" | "youtube" | "clip" | "post" | "music" | "repo" | "commerce" | "stream" | "linkedin" | "indeed" | "zomato" | "swiggy" | "pinterest" | "app" | "stay" | "game" | "book" | "launch" | "ytmusic" | "jiosaavn" | "gaana" | "applemusic" | "netflix" | "primevideo" | "hotstar" | "kukufm" | "applepodcasts" | "pocketfm" | "kindle" | "wattpad" | "pratilipi" | "webtoon" | "medium" | "amazon" | "meesho" | "flipkart" | "blogspot" | "devto" | "xarticle" | "linkedarticle" | "substack" | "wordpress" | "hashnode" | "ebay" | "etsy" | "aliexpress" | "walmart" | "linksnap";
export type AspectRatio = "story" | "square";
export type CardBackgroundMode = "image" | "color";
export type CardColorScheme = "light" | "dark";
export type CardImageFit = "cover" | "contain";

type CardColors = {
  surface: string;
  primary: string;
  secondary: string;
  muted: string;
  subtle: string;
  divider: string;
  border: string;
};

const LIGHT_CARD_COLORS: CardColors = {
  surface: "#FFFFFF",
  primary: "#111111",
  secondary: "#444444",
  muted: "#717171",
  subtle: "#F3F4F6",
  divider: "#E5E7EB",
  border: "rgba(0, 0, 0, 0.08)",
};

const DARK_CARD_COLORS: CardColors = {
  surface: "#151515",
  primary: "#F5F5F5",
  secondary: "#D4D4D4",
  muted: "#A3A3A3",
  subtle: "#27272A",
  divider: "#3F3F46",
  border: "rgba(255, 255, 255, 0.15)",
};

const CardColorsContext = createContext<CardColors>(LIGHT_CARD_COLORS);
const CardImageFitContext = createContext<CardImageFit>("cover");

function useCardColors() {
  return useContext(CardColorsContext);
}

function CardMedia({ uri, style }: { uri: string; style: StyleProp<ImageStyle> }) {
  const imageFit = useContext(CardImageFitContext);
  if (imageFit === "cover") {
    return <Image source={{ uri }} style={style} resizeMode="cover" />;
  }
  return (
    <View style={style}>
      <Image source={{ uri }} style={styles.cardMediaFill} resizeMode="cover" blurRadius={18} />
      <View style={[styles.cardMediaFill, styles.cardMediaVeil]} />
      <Image source={{ uri }} style={styles.cardMediaFill} resizeMode="contain" />
    </View>
  );
}

export type LinkCardViewProps = ViewProps & {
  preview?: LinkPreview | null;
  loading?: boolean;
  error?: string | null;
  theme?: CardTheme;
  aspectRatio?: AspectRatio;
  safeMode?: boolean;
  /** Light or dark styling for templates that support both appearances. */
  colorScheme?: CardColorScheme;
  /** How content images fill their frames. */
  imageFit?: CardImageFit;
  /** Scene background mode: "image" uses a blurred backdrop, "color" uses a solid fill. */
  bgMode?: CardBackgroundMode;
  /** Solid background color when bgMode is "color". */
  bgColor?: string;
  /** Optional image used only for the full-bleed scene background. */
  backgroundImage?: string | null;
  /** Backdrop blur strength (image mode). 0 = sharp. */
  blurRadius?: number;
  /** Vignette strength over the scene background, 0 (off) to 1 (max). */
  vignette?: number;
  /** When true, hides all engagement counts (views/watching/likes/comments/etc.). */
  hideCounts?: boolean;
  /** When true, hides the "N min read" label on blog/reading cards. */
  hideReadTime?: boolean;
  /** Manual overrides from the studio controls (take precedence over parsed meta). */
  author?: string;
  readMinutes?: string;
  dateText?: string;
  location?: string;
  /** Site favicon (from parsed metadata) shown in the generic card footer. */
  favicon?: string | null;
  /** Tweet/X extras (auto from oEmbed when available, else manual). */
  handle?: string;
  verified?: boolean;
  likes?: string;
  replies?: string;
  avatarUrl?: string;
  /** YouTube extras (auto from worker/scrape when available, else manual). */
  youtubeKind?: YouTubeKind | "";
  duration?: string;
  views?: string;
  watching?: string;
  /** Twitch extras (auto from Worker Helix when configured, else manual). */
  streamKind?: TwitchKind | "";
  game?: string;
  viewers?: string;
  /** Reddit extras. */
  subreddit?: string;
  score?: string;
  /** Commerce extras (price strings keep their currency symbols). */
  price?: string;
  mrp?: string;
  rating?: string;
  seller?: string;
  /** Marketplace extras (eBay/Etsy/Walmart) — manual-first, parsed meta as fallback. */
  condition?: string;
  sold?: string;
  sellerFeedback?: string;
  feedbackPercent?: number | null;
  /** LinkedIn post extras. */
  headline?: string;
  reposts?: string;
  /** Indeed job extras (salary/location/manual). */
  salary?: string;
  jobType?: string;
  /** Restaurant extras (Zomato/Swiggy). */
  cuisine?: string;
  eta?: string;
  /** App Store / Play Store extras. */
  category?: string;
  downloads?: string;
  /** Airbnb / stay listing extras. */
  host?: string;
  /** Steam game extras. */
  genre?: string;
  releaseDate?: string;
  /** Book extras. */
  pages?: string;
  /** Product Hunt launch extras. */
  tagline?: string;
  upvotes?: string;
};

/** Floating card width relative to the scene canvas. Height is content-driven. */
const CARD_W_RATIO = 0.88;
const CARD_MAX_H_RATIO = 0.84;

/** Blurred image backdrop that fills the scene behind the card. Kept soft enough
 *  to read as the link's image, with a veil so the card stays legible. */
const SCENE_BLUR = 8;
/** Zoom factor applied to the scene backdrop behind the card. The eyedropper
 *  sampler in pixel-sampler.ts uses this same constant. */
export { SCENE_SCALE };
const SCENE_VEIL = "rgba(10, 10, 18, 0.42)";

const CARD_META: Record<CardTheme, { surface: string; radius: number; border: string }> = {
  tweet: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  youtube: { surface: "#0F0F0F", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  clip: { surface: "#000000", radius: 18, border: "rgba(255, 255, 255, 0.15)" },
  post: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  music: { surface: "#121212", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  repo: { surface: "#0D1117", radius: 18, border: "rgba(255, 255, 255, 0.15)" },
  commerce: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  stream: { surface: "#0E0A13", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  linkedin: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  indeed: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  zomato: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  swiggy: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  pinterest: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  app: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  stay: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  game: { surface: "#1B2838", radius: 18, border: "rgba(255, 255, 255, 0.15)" },
  book: { surface: "#F4F1EA", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  launch: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  ytmusic: { surface: "#0F0F0F", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  jiosaavn: { surface: "#111012", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  gaana: { surface: "#0C1410", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  applemusic: { surface: "#FAFAFA", radius: 24, border: "rgba(0, 0, 0, 0.08)" },
  netflix: { surface: "#000000", radius: 18, border: "rgba(255, 255, 255, 0.15)" },
  primevideo: { surface: "#0B1425", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  hotstar: { surface: "#0F0E2A", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  kukufm: { surface: "#1A1613", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  applepodcasts: { surface: "#14141B", radius: 20, border: "rgba(255, 255, 255, 0.15)" },
  pocketfm: { surface: "#08110E", radius: 22, border: "rgba(255, 255, 255, 0.15)" },
  kindle: { surface: "#F2EFE9", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  wattpad: { surface: "#FFFFFC", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  pratilipi: { surface: "#FFF7ED", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  webtoon: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  medium: { surface: "#FFFFFF", radius: 24, border: "rgba(0, 0, 0, 0.08)" },
  amazon: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  meesho: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  flipkart: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  blogspot: { surface: "#FFFFFF", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
  devto: { surface: "#FAFAFA", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
  xarticle: { surface: "#FFFFFF", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
  linkedarticle: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  substack: { surface: "#FFFFFF", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
  wordpress: { surface: "#FFFFFF", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
  hashnode: { surface: "#FFFFFF", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
  ebay: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  etsy: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  aliexpress: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  walmart: { surface: "#FFFFFF", radius: 18, border: "rgba(0, 0, 0, 0.08)" },
  linksnap: { surface: "#FFFFFF", radius: 20, border: "rgba(0, 0, 0, 0.08)" },
};

/**
 * Full-bleed scene backdrop. When an image is present it is scaled + blurred +
 * darkened (RN primitives only so it survives react-native-view-shot capture on
 * native and the html2canvas web path). Without an image a deterministic dark
 * palette tint derived from the link's domain is used instead.
 */
function SceneBackdrop({
  image,
  palette,
  mode,
  solidColor,
  blur,
  vignette,
}: {
  image: string | null;
  palette: Palette;
  mode: CardBackgroundMode;
  solidColor: string;
  blur: number;
  vignette: number;
}) {
  const v = Math.min(1, Math.max(0, vignette));
  return (
    <View style={styles.sceneBackdrop}>
      {mode === "color" || !image ? (
        <View
          style={[
            styles.sceneBackdropFill,
            { backgroundColor: mode === "color" ? solidColor : palette.to },
          ]}
        />
      ) : (
        <>
          <Image
            source={{ uri: image }}
            style={[styles.sceneBackdropFill, styles.sceneBackdropBlur]}
            resizeMode="cover"
            blurRadius={blur}
          />
          <View style={[styles.sceneBackdropFill, styles.sceneBackdropVeil]} />
        </>
      )}
      {v > 0 ? (
        <Svg width="100%" height="100%" style={styles.sceneBackdropFill}>
          <Defs>
            <RadialGradient id="vignette" cx="50%" cy="48%" rx="72%" ry="58%">
              <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
              <Stop offset="48%" stopColor="#000000" stopOpacity={0} />
              <Stop offset="78%" stopColor="#000000" stopOpacity={0.24 * v} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.82 * v} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#vignette)" />
        </Svg>
      ) : null}
    </View>
  );
}

/** Compact embed-style card floating over the blurred scene. Height is driven
 *  by content (chat-embed look), capped so it always fits the scene. */
function CardShell({
  theme,
  colorScheme,
  children,
}: {
  theme: CardTheme;
  colorScheme: CardColorScheme;
  children: ReactNode;
}) {
  const meta = CARD_META[theme];
  const colors = colorScheme === "dark" ? DARK_CARD_COLORS : LIGHT_CARD_COLORS;
  return (
    <View
      style={[
        styles.shell,
        {
          width: `${CARD_W_RATIO * 100}%`,
          maxHeight: `${CARD_MAX_H_RATIO * 100}%`,
          borderRadius: meta.radius,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View
        style={[
          styles.shellSurface,
          {
            borderRadius: meta.radius,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <CardColorsContext.Provider value={colors}>{children}</CardColorsContext.Provider>
      </View>
    </View>
  );
}

function getInitials(name: string): string {
  const parts = name.replace(/^@/, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function cleanAuthor(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  let s = raw.trim().replace(/^@/, "");
  // twitter:creator often arrives as "@handle" — keep handle without @
  s = s.split("|")[0].trim();
  return s || fallback;
}

function publisherFrom(preview: LinkPreview | null | undefined, url: string): string {
  if (preview?.siteName) return preview.siteName.trim();
  const host = domainFromUrl(url).replace(/^www\./, "");
  const base = host.split(".")[0] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function readMinutesOf(
  override: string | undefined,
  preview: LinkPreview | null | undefined,
): number {
  const n = override ? parseInt(override.replace(/\D/g, ""), 10) : NaN;
  if (Number.isFinite(n) && n > 0 && n < 180) return n;
  if (preview?.readingMinutes && preview.readingMinutes > 0) return preview.readingMinutes;
  return 2;
}

function countOf(
  override: string | undefined,
  parsed: number | null | undefined,
): number | null {
  const n = override ? parseInt(override.replace(/\D/g, ""), 10) : NaN;
  if (Number.isFinite(n) && n >= 0) return n;
  if (typeof parsed === "number" && parsed >= 0) return parsed;
  return null;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${trimNum(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trimNum(n / 1_000)}K`;
  return String(n);
}

function trimNum(n: number): string {
  return String(Math.round(n * 10) / 10).replace(/\.0$/, "");
}

/** "12:34"/"1:02:03"/"90"/"2h14m30s" → seconds. Null when unparseable. */
function parseDurationInput(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (/^\d+$/.test(s)) return Number(s);
  const hms = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (hms && (hms[1] || hms[2] || hms[3])) {
    return Number(hms[1] || 0) * 3600 + Number(hms[2] || 0) * 60 + Number(hms[3] || 0);
  }
  const parts = s.split(":").map((p) => Number(p));
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/** "1.2M"/"34K"/"550" → number. Null when unparseable. */
function parseCountInput(raw: string | undefined): number | null {
  if (!raw) return null;
  const m = raw.trim().replace(/,/g, "").match(/^([\d.]+)\s*([KMB])?$/i);
  if (!m) return null;
  const mult = m[2] ? { K: 1e3, M: 1e6, B: 1e9 }[m[2].toUpperCase() as "K" | "M" | "B"] : 1;
  return Math.round(Number(m[1]) * mult);
}

function resolveCount(
  override: string | undefined,
  parsed: number | null | undefined,
): number | null {
  const n = parseCountInput(override);
  if (n != null && n >= 0) return n;
  if (typeof parsed === "number" && parsed >= 0) return parsed;
  return null;
}

/** ISO date → "3 days ago" / "2 months ago" … */
function timeAgo(iso: string | null | undefined): string | null {  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

type CommerceRatingStyle = "stars" | "pill";

type StoreDesign = {
  label: string;
  color: string;
  wordmarkStyle?: {
    fontStyle?: "italic" | "normal";
    fontFamily?: string;
    fontWeight?: "400" | "600" | "700" | "800";
    letterSpacing?: number;
  };
  priceColor: string;
  dealBackground: string;
  dealColor: string;
  ratingStyle: CommerceRatingStyle;
  ratingColor: string;
  ratingTextColor: string;
  ratingCountColor: string;
  sellerPrefix: string;
};

const STORE_DESIGN: Record<CommerceStore, StoreDesign> = {
  amazon: {
    label: "amazon",
    color: "#FF9900",
    wordmarkStyle: { fontStyle: "italic", fontWeight: "800", letterSpacing: -0.5 },
    priceColor: "#0F1111",
    dealBackground: "#FDECEA",
    dealColor: "#B12704",
    ratingStyle: "stars",
    ratingColor: "#FFA41C",
    ratingTextColor: "#0F1111",
    ratingCountColor: "#007185",
    sellerPrefix: "Sold by",
  },
  flipkart: {
    label: "Flipkart",
    color: "#2874F0",
    wordmarkStyle: { fontStyle: "italic", fontWeight: "800" },
    priceColor: "#212121",
    dealBackground: "#E8F5E9",
    dealColor: "#038E63",
    ratingStyle: "pill",
    ratingColor: "#388E3C",
    ratingTextColor: "#FFFFFF",
    ratingCountColor: "#878787",
    sellerPrefix: "Seller:",
  },
  meesho: {
    label: "meesho",
    color: "#F43397",
    wordmarkStyle: { fontWeight: "800", letterSpacing: 0.3 },
    priceColor: "#333333",
    dealBackground: "#FDE7F1",
    dealColor: "#C2185B",
    ratingStyle: "pill",
    ratingColor: "#038E63",
    ratingTextColor: "#FFFFFF",
    ratingCountColor: "#757575",
    sellerPrefix: "Supplier:",
  },
  ebay: {
    label: "ebay",
    color: "#E53238",
    wordmarkStyle: { fontWeight: "800", letterSpacing: -0.5 },
    priceColor: "#191919",
    dealBackground: "#F6F7F8",
    dealColor: "#191919",
    ratingStyle: "stars",
    ratingColor: "#3665F3",
    ratingTextColor: "#191919",
    ratingCountColor: "#707070",
    sellerPrefix: "Seller:",
  },
  etsy: {
    label: "Etsy",
    color: "#F1641E",
    wordmarkStyle: { fontFamily: "serif", fontWeight: "700" },
    priceColor: "#222222",
    dealBackground: "#FDEBD7",
    dealColor: "#9A3412",
    ratingStyle: "stars",
    ratingColor: "#222222",
    ratingTextColor: "#222222",
    ratingCountColor: "#595959",
    sellerPrefix: "Shop:",
  },
  aliexpress: {
    label: "AliExpress",
    color: "#E61110",
    wordmarkStyle: { fontWeight: "800", letterSpacing: 0.2 },
    priceColor: "#D7230C",
    dealBackground: "#FDECE9",
    dealColor: "#E53238",
    ratingStyle: "stars",
    ratingColor: "#FFA41C",
    ratingTextColor: "#333333",
    ratingCountColor: "#757575",
    sellerPrefix: "Seller:",
  },
  walmart: {
    label: "Walmart",
    color: "#0071DC",
    wordmarkStyle: { fontWeight: "800", letterSpacing: -0.3 },
    priceColor: "#2E2F32",
    dealBackground: "#E6F1FB",
    dealColor: "#0071DC",
    ratingStyle: "stars",
    ratingColor: "#FFC220",
    ratingTextColor: "#2E2F32",
    ratingCountColor: "#74767C",
    sellerPrefix: "Sold by",
  },
  other: {
    label: "Shop",
    color: "#111111",
    wordmarkStyle: { fontWeight: "800" },
    priceColor: "#111111",
    dealBackground: "#E8F5E9",
    dealColor: "#1E8E3E",
    ratingStyle: "stars",
    ratingColor: "#FFA41C",
    ratingTextColor: "#333333",
    ratingCountColor: "#333333",
    sellerPrefix: "Sold by",
  },
};

/** "₹1,299.00" / "$79.99" → 1299 / 79.99. Null when unparseable. */
function parsePriceNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseRatingInput(raw: string | undefined, parsed: number | null | undefined): number | null {
  if (raw) {
    const n = Number(raw.trim());
    if (Number.isFinite(n) && n >= 0 && n <= 5) return n;
  }
  if (typeof parsed === "number" && parsed >= 0) return Math.min(5, parsed);
  return null;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Ruby: "#701516",
  "C++": "#F34B7D",
  C: "#555555",
  PHP: "#4F5D95",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
};

const LinkCardView = forwardRef<View, LinkCardViewProps>(function LinkCardView(
  {
    preview,
    theme = "post",
    aspectRatio = "story",
    safeMode = false,
    colorScheme = "light",
    imageFit = "cover",
    bgMode = "image",
    bgColor = "#0B0B12",
    backgroundImage,
    blurRadius = SCENE_BLUR,
    vignette = 0,
    hideCounts = false,
    hideReadTime = false,
    author,
    readMinutes,
    dateText,
    location,
    favicon,
    handle,
    verified,
    likes,
    replies,
    avatarUrl,
    youtubeKind,
    duration,
    views,
    watching,
    streamKind,
    game,
    viewers,
    subreddit,
    score,
    price,
    mrp,
    rating,
    seller,
    condition,
    sold,
    sellerFeedback,
    feedbackPercent,
    headline,
    reposts,
    salary,
    jobType,
    cuisine,
    eta,
    category,
    downloads,
    host,
    genre,
    releaseDate,
    pages,
    tagline,
    upvotes,
    style,
    ...rest
  },
  ref,
) {
  const [width, setWidth] = useState(0);
  const isStory = aspectRatio === "story";
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const height = width * (isStory ? 16 / 9 : 1);
  const safeTop = isStory && safeMode ? height * 0.12 : 0;
  const safeBottom = isStory && safeMode ? height * 0.1 : 0;

  const url = preview?.url || "https://example.com";
  const title = preview?.title?.trim() || "Paste a link to generate your story card";
  const excerpt = preview?.description?.trim() || "";
  const publisher = publisherFrom(preview || null, url);
  const previewImage = preview?.imageFallback || preview?.image || null;
  const palette = getPalette(domainFromUrl(url));
  const authorName = cleanAuthor(author || preview?.author, publisher);
  const minutes = readMinutesOf(readMinutes, preview || null);
  // A generic link isn't necessarily an article — only show "N min read" when a
  // real reading time exists (parsed from the page or entered manually).
  const manualRead = readMinutes ? parseInt(readMinutes.replace(/\D/g, ""), 10) : NaN;
  const hasReadTime =
    !hideReadTime && ((preview?.readingMinutes ?? 0) > 0 || (Number.isFinite(manualRead) && manualRead > 0));
  const dateLabel = (dateText || "").trim() || formatDateLabel(preview?.publishedAt || null);
  const pill = (location || "").trim() || preview?.siteName?.trim() || domainFromUrl(url);

  // Tweet/X resolution (oEmbed first, manual override wins, sensible fallback last)
  const tweetHandle = (handle || "").trim().replace(/^@/, "") || preview?.handle || null;
  const tweetVerified = typeof verified === "boolean" ? verified : !!preview?.verified;
  const likeCount = countOf(likes, preview?.likeCount);
  const replyCount = countOf(replies, preview?.replyCount);
  const avatar = (avatarUrl || "").trim() || preview?.avatar || null;

  // YouTube resolution (worker/scrape first, manual override wins)
  const ytKind: YouTubeKind =
    youtubeKind || preview?.youtubeKind || youtubeKindFromUrl(url);
  const ytDuration =
    parseDurationInput(duration) ?? preview?.durationSec ?? null;
  const viewsResolved = resolveCount(views, preview?.viewCount);
  const ytWatching = (watching || "").trim() || null;
  const ytScheduled =
    ytWatching ||
    (preview?.scheduledStart
      ? formatDateLabel(preview.scheduledStart)
      : null);

  // Reddit resolution
  const rdSub = (subreddit || "").trim() || preview?.subreddit || null;
  const rdScore = countOf(score, preview?.postScore);
  const rdComments = countOf(replies, preview?.commentCount ?? preview?.replyCount);

  // Spotify resolution (artist usually needs a manual entry)
  const spKind: SpotifyKind | null = preview?.spotifyKind || null;
  // Brand-generic kind label for the non-Spotify music templates.
  const mKind = spKind ? (SPOTIFY_LABEL[spKind] || spKind.toUpperCase()) : null;

  // Commerce resolution (price strings keep currency symbols for display)
  const store: CommerceStore = preview?.commerceStore || commerceStoreFromUrl(url) || "other";
  const cPrice = (price || "").trim() || preview?.commercePrice || null;
  const cMrp = (mrp || "").trim() || preview?.commerceMrp || null;
  const cRating = parseRatingInput(rating, preview?.commerceRating);
  const cReviews = preview?.commerceReviews ?? null;
  const cSeller = (seller || "").trim() || preview?.commerceSeller || null;

  // LinkedIn resolution
  const liHeadline = (headline || "").trim() || preview?.headline || null;
  const liReposts = countOf(reposts, preview?.repostCount);

  // Indeed resolution
  const inSalary = (salary || "").trim() || preview?.salary || null;
  const inJobType = (jobType || "").trim() || preview?.jobType || null;
  const inLocation = (location || "").trim() || preview?.jobLocation || null;

  // Restaurant resolution
  const reCuisine = (cuisine || "").trim() || preview?.cuisine || null;
  const reEta = (eta || "").trim() || preview?.eta || null;

  // App resolution
  const apCategory = (category || "").trim() || preview?.category || null;
  const apDownloads = (downloads || "").trim() || preview?.downloads || null;

  // Stay resolution
  const syHost = (host || "").trim() || preview?.hostName || null;

  // Game resolution
  const gmGenre = (genre || "").trim() || preview?.genre || null;
  const gmRelease = (releaseDate || "").trim() || preview?.releaseDate || null;

  // Book resolution
  const bkPages = pages ? parseInt(pages.replace(/\D/g, ""), 10) || null : preview?.pages ?? null;

  // Launch resolution
  const lcTagline = (tagline || "").trim() || preview?.description?.trim() || null;
  const lcUpvotes = countOf(upvotes, preview?.upvotes);

  // Blog / article resolution
  const blogSite = preview?.siteName?.trim() || publisher;
  const blogTags = preview?.tags || null;
  const xaViews = resolveCount(views, preview?.viewCount);
  const laLikes = countOf(likes, preview?.likeCount);
  const laComments = countOf(replies, preview?.commentCount ?? preview?.replyCount);

  // Commerce extras (eBay/Etsy/Walmart) — manual override wins, parsed meta as fallback
  const cCondition = (condition || "").trim() || preview?.commerceCondition || null;
  const cSold = (sold || "").trim() || preview?.commerceSold || null;
  const cFeedbackRaw = feedbackPercent ?? preview?.sellerFeedbackPercent ?? null;
  const cFeedbackPercent =
    typeof cFeedbackRaw === "number"
      ? cFeedbackRaw
      : parseFloat(String(cFeedbackRaw).replace(/[^\d.]/g, "")) || null;
  const cSellerFeedback = (sellerFeedback || "").trim() || preview?.commerceSellerFeedback || null;

  // Twitch resolution (Worker Helix first, manual override wins)
  const stKind: TwitchKind =
    streamKind || preview?.twitchKind || "channel";
  const stGame = (game || "").trim() || preview?.gameName || null;
  const stViewers = resolveCount(viewers, preview?.viewerCount ?? preview?.viewCount);
  const stDuration = parseDurationInput(duration) ?? preview?.durationSec ?? null;
  const stLogin = preview?.twitchLogin || null;

  const renderTheme = () => {
    if (theme === "stream") {
      return (
        <StreamCard
          kind={stKind}
          isStory={isStory}
          title={title}
          streamer={authorName}
          login={stLogin}
          avatar={(avatarUrl || "").trim() || preview?.avatar || null}
          thumb={previewImage}
          game={stGame}
          viewers={stViewers}
          durationSec={stDuration}
          age={timeAgo(preview?.publishedAt || null)}
          hideCounts={hideCounts}
        />
      );
    }
    if (theme === "linkedin") {
      return (
        <LinkedInCard
          headline={liHeadline}
          description={excerpt}
          authorName={authorName}
          timeLabel={dateLabel}
          reposts={liReposts}
          likes={likeCount}
          avatar={avatar}
          hideCounts={hideCounts}
        />
      );
    }
    if (theme === "indeed") {
      return (
        <IndeedCard
          title={title}
          company={authorName}
          location={inLocation}
          salary={inSalary}
          jobType={inJobType}
          image={previewImage}
          posted={timeAgo(preview?.publishedAt || null)}
        />
      );
    }
    if (theme === "zomato" || theme === "swiggy") {
      const brand = theme === "zomato" ? "zomato" : "swiggy";
      return (
        <RestaurantCard
          brand={brand}
          title={title}
          image={previewImage}
          cuisine={reCuisine}
          location={inLocation}
          price={cPrice}
          rating={cRating}
          reviews={cReviews}
          eta={reEta}
        />
      );
    }
    if (theme === "pinterest") {
      return (
        <PinterestCard
          title={title}
          description={excerpt}
          image={previewImage}
          authorName={authorName}
        />
      );
    }
    if (theme === "app") {
      return (
        <AppCard
          platform={preview?.appPlatform ?? null}
          title={title}
          description={excerpt}
          image={previewImage}
          developer={authorName}
          category={apCategory}
          downloads={apDownloads}
          price={cPrice}
          rating={cRating}
          reviews={cReviews}
        />
      );
    }
    if (theme === "stay") {
      return (
        <StayCard
          title={title}
          location={pill}
          host={syHost}
          price={cPrice}
          rating={cRating}
          reviews={cReviews}
          image={previewImage}
        />
      );
    }
    if (theme === "game") {
      return (
        <GameCard
          title={title}
          description={excerpt}
          image={previewImage}
          genre={gmGenre}
          releaseDate={gmRelease}
          metacritic={cRating}
          price={cPrice}
        />
      );
    }
    if (theme === "book") {
      return (
        <BookCard
          title={title}
          authorName={authorName}
          pages={bkPages}
          rating={cRating}
          reviews={cReviews}
          image={previewImage}
        />
      );
    }
    if (theme === "launch") {
      return (
        <LaunchCard
          title={title}
          tagline={lcTagline}
          maker={authorName}
          upvotes={lcUpvotes}
        />
      );
    }
    if (
      theme === "amazon" ||
      theme === "meesho" ||
      theme === "flipkart" ||
      theme === "ebay" ||
      theme === "etsy" ||
      theme === "aliexpress" ||
      theme === "walmart"
    ) {
      return (
        <CommerceCard
          store={theme}
          title={title}
          image={previewImage}
          price={cPrice}
          mrp={cMrp}
          rating={cRating}
          reviews={cReviews}
          seller={cSeller}
          condition={cCondition}
          sold={cSold}
          sellerFeedback={cSellerFeedback}
          feedbackPercent={cFeedbackPercent}
        />
      );
    }
    if (theme === "commerce") {
      return (
        <CommerceCard
          store={store}
          title={title}
          image={previewImage}
          price={cPrice}
          mrp={cMrp}
          rating={cRating}
          reviews={cReviews}
          seller={cSeller}
          condition={cCondition}
          sold={cSold}
          sellerFeedback={cSellerFeedback}
          feedbackPercent={cFeedbackPercent}
        />
      );
    }
    if (theme === "blogspot") {
      return (
        <BlogspotCard
          title={title}
          blog={blogSite}
          authorName={authorName}
          excerpt={excerpt}
          image={previewImage}
          dateLabel={dateLabel}
          minutes={minutes}
          tags={blogTags}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "devto") {
      return (
        <DevToCard
          title={title}
          authorName={authorName}
          excerpt={excerpt}
          image={previewImage}
          dateLabel={dateLabel}
          minutes={minutes}
          tags={blogTags}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "xarticle") {
      return (
        <XArticleCard
          headline={title}
          excerpt={excerpt}
          authorName={authorName}
          handle={tweetHandle}
          verified={tweetVerified}
          avatar={avatar}
          image={previewImage}
          dateLabel={dateLabel}
          views={xaViews}
          hideCounts={hideCounts}
        />
      );
    }
    if (theme === "linkedarticle") {
      return (
        <LinkedArticleCard
          headline={title}
          authorName={authorName}
          avatar={avatar}
          image={previewImage}
          dateLabel={dateLabel}
          likes={laLikes}
          comments={laComments}
          minutes={minutes}
          hideCounts={hideCounts}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "substack") {
      return (
        <SubstackCard
          title={title}
          publication={blogSite}
          authorName={authorName}
          subtitle={excerpt}
          image={previewImage}
          dateLabel={dateLabel}
          likes={likeCount}
          comments={laComments}
          minutes={minutes}
          hideCounts={hideCounts}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "wordpress") {
      return (
        <WordPressCard
          title={title}
          site={blogSite}
          authorName={authorName}
          excerpt={excerpt}
          image={previewImage}
          dateLabel={dateLabel}
          minutes={minutes}
          tags={blogTags}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "hashnode") {
      return (
        <HashnodeCard
          title={title}
          publication={blogSite}
          authorName={authorName}
          excerpt={excerpt}
          image={previewImage}
          dateLabel={dateLabel}
          likes={laLikes}
          comments={laComments}
          minutes={minutes}
          tags={blogTags}
          hideCounts={hideCounts}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "repo") {
      return (
        <RepoCard
          fullName={preview?.repoFullName || title}
          description={excerpt}
          avatar={avatar}
          stars={preview?.repoStars ?? null}
          forks={preview?.repoForks ?? null}
          language={preview?.repoLanguage || null}
          updated={timeAgo(preview?.publishedAt || null)}
        />
      );
    }
    if (theme === "music") {
      return (
        <MusicCard
          kind={spKind}
          title={title}
          artist={authorName}
          cover={previewImage}
        />
      );
    }
    if (theme === "post") {
      return (
        <PostCard
          subreddit={rdSub}
          title={title}
          selftext={excerpt}
          image={previewImage}
          authorName={authorName}
          views={viewsResolved}
          score={rdScore}
          comments={rdComments}
          age={timeAgo(preview?.publishedAt || null)}
          hideCounts={hideCounts}
        />
      );
    }
    if (theme === "clip") {
      return (
        <ClipCard
          caption={title}
          authorName={authorName}
          handle={tweetHandle}
          poster={previewImage}
          views={viewsResolved}
          likes={likeCount}
          comments={replyCount}
          hideCounts={hideCounts}
        />
      );
    }
    if (theme === "youtube") {
      return (
        <YouTubeCard
          kind={ytKind}
          isStory={isStory}
          title={title}
          channel={authorName}
          thumb={previewImage}
          channelAvatar={avatar}
          durationSec={ytDuration}
          views={viewsResolved}
          age={timeAgo(preview?.publishedAt || null)}
          scheduledLabel={ytScheduled}
          watchingLabel={ytWatching}
          concurrentViewers={preview?.concurrentViewers ?? null}
          hideCounts={hideCounts}
          colorScheme={colorScheme}
        />
      );
    }
    if (theme === "tweet") {
      return (
        <TweetCard
          body={title}
          authorName={authorName}
          handle={tweetHandle}
          verified={tweetVerified}
          timeLabel={dateLabel}
          views={viewsResolved}
          likeCount={likeCount}
          replyCount={replyCount}
          avatar={avatar}
          hideCounts={hideCounts}
        />
      );
    }
    if (theme === "ytmusic") {
      return (
        <YtMusicCard
          title={title}
          artist={authorName}
          cover={previewImage}
          kind={mKind}
        />
      );
    }
    if (theme === "jiosaavn") {
      return (
        <JioSaavnCard
          title={title}
          artist={authorName}
          cover={previewImage}
          kind={mKind}
          durationSec={ytDuration}
        />
      );
    }
    if (theme === "gaana") {
      return (
        <GaanaCard
          title={title}
          artist={authorName}
          cover={previewImage}
          kind={mKind}
        />
      );
    }
    if (theme === "applemusic") {
      return (
        <AppleMusicCard
          title={title}
          artist={authorName}
          cover={previewImage}
          kind={mKind}
        />
      );
    }
    if (theme === "netflix") {
      return (
        <NetflixCard
          title={title}
          tagline={excerpt}
          image={previewImage}
          meta={pill}
        />
      );
    }
    if (theme === "primevideo") {
      return (
        <PrimeVideoCard
          title={title}
          tagline={excerpt}
          image={previewImage}
          meta={pill}
          rating={cRating}
        />
      );
    }
    if (theme === "hotstar") {
      return (
        <HotstarCard
          title={title}
          tagline={excerpt}
          image={previewImage}
          meta={pill}
          age={dateLabel}
        />
      );
    }
    if (theme === "kukufm") {
      return (
        <KukuFmCard
          title={title}
          host={authorName}
          show={excerpt}
          durationSec={ytDuration}
        />
      );
    }
    if (theme === "applepodcasts") {
      return (
        <ApplePodcastsCard
          title={title}
          show={authorName}
          cover={previewImage}
          durationSec={ytDuration}
        />
      );
    }
    if (theme === "pocketfm") {
      return (
        <PocketFmCard
          title={title}
          host={authorName}
          show={excerpt}
          image={previewImage}
          durationSec={ytDuration}
        />
      );
    }
    if (theme === "kindle") {
      return (
        <KindleCard
          title={title}
          authorName={authorName}
          pages={bkPages}
          rating={cRating}
          reviews={cReviews}
          image={previewImage}
        />
      );
    }
    if (theme === "wattpad") {
      return (
        <WattpadCard
          title={title}
          authorName={authorName}
          rating={cRating}
          reviews={cReviews}
          image={previewImage}
        />
      );
    }
    if (theme === "pratilipi") {
      return (
        <PratilipiCard
          title={title}
          authorName={authorName}
          excerpt={excerpt}
          image={previewImage}
        />
      );
    }
    if (theme === "webtoon") {
      return (
        <WebtoonCard
          title={title}
          authorName={authorName}
          rating={cRating}
          reviews={cReviews}
          image={previewImage}
        />
      );
    }
    if (theme === "medium") {
      return (
        <MediumCard
          title={title}
          authorName={authorName}
          minutes={minutes}
          excerpt={excerpt}
          dateLabel={dateLabel}
          image={previewImage}
          hideReadTime={hideReadTime}
        />
      );
    }
    if (theme === "linksnap") {
      return (
        <DynamicCard
          isStory={isStory}
          cardWidth={width}
          title={title}
          excerpt={excerpt}
          authorName={authorName}
          minutes={minutes}
          showReadTime={hasReadTime}
          image={previewImage}
          favicon={favicon ?? preview?.favicon ?? null}
        />
      );
    }
    return null;
  };

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={onLayout}
      style={[styles.canvas, { aspectRatio: isStory ? 9 / 16 : 1 }, style]}
      {...rest}
    >
      {width > 0 ? (
        <>
          <SceneBackdrop image={backgroundImage ?? previewImage} palette={palette} mode={bgMode} solidColor={bgColor} blur={blurRadius} vignette={vignette} />
          <View style={[styles.scene, { paddingTop: safeTop, paddingBottom: safeBottom }]}>
            <CardImageFitContext.Provider value={imageFit}>
              <CardShell theme={theme} colorScheme={colorScheme}>{renderTheme()}</CardShell>
            </CardImageFitContext.Provider>
          </View>
        </>
      ) : null}
    </View>
  );
});

/* ---------------- Template E: TikTok clip card ---------------- */

function ClipCard({
  caption,
  authorName,
  handle,
  poster,
  views,
  likes,
  comments,
  hideCounts,
}: {
  caption: string;
  authorName: string;
  handle: string | null;
  poster: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  hideCounts: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.clip, { backgroundColor: colors.surface }]}>
      <View style={styles.clipProviderRow}>
        <View style={styles.clipDot} />
        <Text style={[styles.clipProvider, { color: colors.muted }]} numberOfLines={1}>
          TikTok
        </Text>
        <Text style={[styles.clipAuthor, { color: colors.primary }]} numberOfLines={1}>
          @{handle || authorName.replace(/^@/, "")}
        </Text>
      </View>
      <Text style={[styles.clipCaption, { color: colors.primary }]} numberOfLines={3}>
        {caption}
      </Text>
      {poster ? (
        <View style={styles.clipPosterWrap}>
          <CardMedia uri={poster} style={styles.clipPoster} />
        </View>
      ) : null}
      {!hideCounts && (views != null || likes != null || comments != null) ? (
        <View style={styles.clipFooter}>
          {views != null ? (
            <View style={styles.clipStat}>
              <Play size={14} color="#FE2C55" fill="#FE2C55" strokeWidth={2} />
              <Text style={[styles.clipStatText, { color: colors.secondary }]}>{formatCompact(views)}</Text>
            </View>
          ) : null}
          {likes != null ? (
            <View style={styles.clipStat}>
              <Heart size={14} color="#FE2C55" fill="#FE2C55" strokeWidth={2} />
              <Text style={[styles.clipStatText, { color: colors.secondary }]}>{formatCompact(likes)}</Text>
            </View>
          ) : null}
          {comments != null ? (
            <View style={styles.clipStat}>
              <MessageCircle size={14} color="#9E9E9E" strokeWidth={2} />
              <Text style={[styles.clipStatText, { color: colors.secondary }]}>{formatCompact(comments)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template F: Reddit post card ---------------- */

function PostCard({
  subreddit,
  title,
  selftext,
  image,
  authorName,
  views,
  score,
  comments,
  age,
  hideCounts,
}: {
  subreddit: string | null;
  title: string;
  selftext: string;
  image: string | null;
  authorName: string;
  views: number | null;
  score: number | null;
  comments: number | null;
  age: string | null;
  hideCounts: boolean;
}) {
  const colors = useCardColors();
  const hasImage = !!image;
  const hasText = selftext.trim().length > 0;
  return (
    <View style={[styles.post, { backgroundColor: colors.surface }]}>
      <View style={styles.postSubRow}>
        <View style={styles.postSubDot}>
          <Text style={styles.postSubDotText}>r/</Text>
        </View>
        <Text style={[styles.postSub, { color: colors.primary }]} numberOfLines={1}>
          r/{subreddit || "reddit"}
        </Text>
        {age ? (
          <Text style={[styles.postAge, { color: colors.muted }]} numberOfLines={1}>
            • {age}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.postTitle, { color: colors.primary }]} numberOfLines={hasImage ? 2 : 3}>
        {title}
      </Text>
      {hasText ? (
        <Text style={[styles.postSelf, { color: colors.secondary }]} numberOfLines={hasImage ? 2 : 4}>
          {selftext}
        </Text>
      ) : null}
      {image ? (
        <View style={styles.postThumbWrap}>
          <CardMedia uri={image} style={styles.postThumb} />
        </View>
      ) : null}
      <View style={styles.postFooter}>
        {!hideCounts && views != null ? (
          <View style={[styles.postPill, { backgroundColor: colors.subtle }]}>
            <Eye size={14} color="#FF4500" strokeWidth={2} />
            <Text style={[styles.postPillText, { color: colors.primary }]}>{formatCompact(views)}</Text>
          </View>
        ) : null}
        {!hideCounts && score != null ? (
          <View style={[styles.postPill, { backgroundColor: colors.subtle }]}>
            <ArrowBigUp size={14} color="#FF4500" strokeWidth={2.2} />
            <Text style={[styles.postPillText, { color: colors.primary }]}>{formatCompact(score)}</Text>
          </View>
        ) : null}
        {!hideCounts && comments != null ? (
          <View style={[styles.postPill, { backgroundColor: colors.subtle }]}>
            <MessageCircle size={13} color="#7C7C7C" strokeWidth={2} />
            <Text style={[styles.postPillText, { color: colors.primary }]}>{formatCompact(comments)}</Text>
          </View>
        ) : null}
        <Text style={[styles.postAuthor, { color: colors.muted }]} numberOfLines={1}>
          u/{authorName.replace(/^u\//, "")}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Template G: Spotify music card ---------------- */

const SPOTIFY_LABEL: Record<string, string> = {
  track: "TRACK",
  album: "ALBUM",
  playlist: "PLAYLIST",
  artist: "ARTIST",
  show: "PODCAST",
  episode: "EPISODE",
};

function MusicCard({
  kind,
  title,
  artist,
  cover,
}: {
  kind: SpotifyKind | null;
  title: string;
  artist: string;
  cover: string | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.music, { backgroundColor: colors.surface }]}>
      <View style={styles.musicProviderRow}>
        <View style={styles.musicDot} />
        <Text style={[styles.musicProvider, { color: colors.muted }]} numberOfLines={1}>
          Spotify
        </Text>
        {kind ? (
          <Text style={styles.musicKind} numberOfLines={1}>
            {SPOTIFY_LABEL[kind] || kind.toUpperCase()}
          </Text>
        ) : null}
      </View>
      <View style={styles.musicRow}>
        {cover ? (
          <CardMedia uri={cover} style={styles.musicCover} />
        ) : (
          <View style={[styles.musicCover, styles.musicCoverFallback]}>
            <Music size={26} color="#1DB954" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.musicCol}>
          <Text style={[styles.musicTitle, { color: colors.primary }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.musicArtist, { color: colors.secondary }]} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>
      <View style={styles.musicFooter}>
        <View style={styles.musicLogo}>
          <Music size={10} color="#000000" strokeWidth={2.5} />
        </View>
        <Text style={[styles.musicFooterText, { color: colors.muted }]}>Spotify</Text>
      </View>
    </View>
  );
}

/* ---------------- Template H: GitHub repo card ---------------- */

function RepoCard({
  fullName,
  description,
  avatar,
  stars,
  forks,
  language,
  updated,
}: {
  fullName: string;
  description: string;
  avatar: string | null;
  stars: number | null;
  forks: number | null;
  language: string | null;
  updated: string | null;
}) {
  const colors = useCardColors();
  const [owner, repo] = fullName.includes("/") ? fullName.split("/", 2) : ["", fullName];
  return (
    <View style={[styles.repo, { backgroundColor: colors.surface }]}>
      <View style={styles.repoHeader}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.repoAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.repoAvatar, styles.repoAvatarFallback]}>
            <Text style={styles.repoAvatarText}>{getInitials(owner || repo)}</Text>
          </View>
        )}
        <View style={styles.repoNames}>
          {owner ? (
            <Text style={[styles.repoOwner, { color: colors.muted }]} numberOfLines={1}>
              {owner} /
            </Text>
          ) : null}
          <Text style={styles.repoName} numberOfLines={1}>
            {repo}
          </Text>
        </View>
        <View style={[styles.repoPublic, { borderColor: colors.divider }]}>
          <Text style={[styles.repoPublicText, { color: colors.muted }]}>Public</Text>
        </View>
      </View>
      {description ? (
        <Text style={[styles.repoDesc, { color: colors.secondary }]} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      <View style={[styles.repoFooter, { borderTopColor: colors.divider }]}>
        {language ? (
          <View style={styles.repoStat}>
            <View style={[styles.repoLangDot, { backgroundColor: LANG_COLORS[language] || "#8B949E" }]} />
            <Text style={[styles.repoStatText, { color: colors.secondary }]}>{language}</Text>
          </View>
        ) : null}
        {stars != null ? (
          <View style={styles.repoStat}>
            <Star size={13} color="#E3B341" fill="#E3B341" strokeWidth={1.5} />
            <Text style={[styles.repoStatText, { color: colors.secondary }]}>{formatCompact(stars)}</Text>
          </View>
        ) : null}
        {forks != null ? (
          <View style={styles.repoStat}>
            <GitFork size={13} color="#8B949E" strokeWidth={2} />
            <Text style={[styles.repoStatText, { color: colors.secondary }]}>{formatCompact(forks)}</Text>
          </View>
        ) : null}
        {updated ? (
          <Text style={[styles.repoUpdated, { color: colors.muted }]} numberOfLines={1}>
            {updated}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ---------------- Template J: Twitch stream/clip/video/channel ---------------- */

function StreamCard({
  kind,
  isStory,
  title,
  streamer,
  login,
  avatar,
  thumb,
  game,
  viewers,
  durationSec,
  age,
  hideCounts,
}: {
  kind: TwitchKind;
  isStory: boolean;
  title: string;
  streamer: string;
  login: string | null;
  avatar: string | null;
  thumb: string | null;
  game: string | null;
  viewers: number | null;
  durationSec: number | null;
  age: string | null;
  hideCounts: boolean;
}) {
  const colors = useCardColors();
  const live = kind === "live";
  const showLabelledCounts = !hideCounts;
  const sub =
    live
      ? [
          viewers != null && showLabelledCounts
            ? `${formatCompact(viewers)} watching`
            : showLabelledCounts
              ? "Live now"
              : null,
          age,
        ]
          .filter(Boolean)
          .join(" • ") || null
      : kind === "channel"
        ? login
          ? `twitch.tv/${login}`
          : "Twitch channel"
        : [
            viewers != null && showLabelledCounts
              ? `${formatCompact(viewers)} views`
              : null,
            age,
          ]
            .filter(Boolean)
            .join(" • ") || null;

  return (
    <View style={[styles.st, { backgroundColor: colors.surface }]}>
      <View style={styles.stProviderRow}>
        <View style={styles.stDot} />
        <Text style={[styles.stProvider, { color: colors.muted }]} numberOfLines={1}>
          Twitch
        </Text>
        {live ? (
          <View style={[styles.stKindChip, styles.stKindLive]}>
            <Text style={styles.stKindText}>LIVE</Text>
          </View>
        ) : kind === "channel" ? (
          <View style={[styles.stKindChip, styles.stKindOff]}>
            <Text style={styles.stKindText}>OFFLINE</Text>
          </View>
        ) : kind === "clip" ? (
          <View style={[styles.stKindChip, styles.stKindClip]}>
            <Play size={9} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            <Text style={styles.stKindText}>Clip</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.stStreamerRow}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.stAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.stAvatar, styles.stAvatarFallback]}>
            <Text style={styles.stAvatarText}>{getInitials(streamer)}</Text>
          </View>
        )}
        <View style={styles.stStreamerCol}>
          <Text style={[styles.stStreamer, { color: colors.primary }]} numberOfLines={1}>
            {streamer}
          </Text>
          {game ? (
            <Text style={styles.stGame} numberOfLines={1}>
              {game}
            </Text>
          ) : null}
        </View>
      </View>
      {title ? (
        <Text style={[styles.stTitle, { color: colors.primary }]} numberOfLines={isStory ? 3 : 2}>
          {title}
        </Text>
      ) : null}
      {sub ? (
        <Text style={[styles.stSub, { color: colors.muted }]} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
      {thumb ? (
        <View style={styles.stThumbWrap}>
          <CardMedia uri={thumb} style={styles.stThumb} />
          {!live && kind !== "channel" && kind !== "clip" && durationSec != null ? (
            <View style={styles.stDuration}>
              <Text style={styles.stDurationText}>{formatDuration(durationSec)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template I: commerce product card ---------------- */

function CommerceCard({
  store,
  title,
  image,
  price,
  mrp,
  rating,
  reviews,
  seller,
  condition,
  sold,
  sellerFeedback,
  feedbackPercent,
}: {
  store: CommerceStore;
  title: string;
  image: string | null;
  price: string | null;
  mrp: string | null;
  rating: number | null;
  reviews: number | null;
  seller: string | null;
  condition?: string | null;
  sold?: string | null;
  sellerFeedback?: string | null;
  feedbackPercent?: number | null;
}) {
  const colors = useCardColors();
  const meta = STORE_DESIGN[store];
  const pNum = parsePriceNumber(price);
  const mNum = parsePriceNumber(mrp);
  const off = pNum != null && mNum != null && mNum > pNum ? Math.round((1 - pNum / mNum) * 100) : null;
  const fullStars = rating != null ? Math.round(rating) : 0;

  return (
    <View style={[styles.com, { backgroundColor: colors.surface }]}>
      {image ? (
        <View style={styles.comImageWrap}>
          <CardMedia uri={image} style={styles.comImage} />
        </View>
      ) : null}
      <View style={[styles.comStore, { backgroundColor: meta.color }]}>
        <Text style={[styles.comStoreText, meta.wordmarkStyle]}>{meta.label}</Text>
      </View>
      {condition ? (
        <View style={[styles.comCondition, { backgroundColor: meta.dealBackground }]}>
          <Text style={[styles.comConditionText, { color: meta.dealColor }]} numberOfLines={1}>
            {condition}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.comTitle, { color: colors.primary }]} numberOfLines={2}>
        {title}
      </Text>
      {price || mrp ? (
        <View style={styles.comPriceRow}>
          {price ? (
            <Text style={[styles.comPrice, { color: colors.primary }]} numberOfLines={1}>
              {price}
            </Text>
          ) : null}
          {mrp ? (
            <Text style={[styles.comMrp, { color: colors.muted }]} numberOfLines={1}>
              {mrp}
            </Text>
          ) : null}
          {off != null ? (
            <View style={[styles.comOff, { backgroundColor: meta.dealBackground }]}>
              <Text style={[styles.comOffText, { color: meta.dealColor }]}>{off}% off</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      {rating != null ? (
        meta.ratingStyle === "pill" ? (
          <View style={styles.comRatingRow}>
            <View style={[styles.comRatingPill, { backgroundColor: meta.ratingColor }]}>
              <Text style={[styles.comRatingPillText, { color: meta.ratingTextColor }]}>
                {rating.toFixed(1)}
              </Text>
              <Star
                size={11}
                color={meta.ratingTextColor}
                fill={meta.ratingTextColor}
                strokeWidth={1}
              />
            </View>
            {reviews != null ? (
              <Text style={[styles.comRatingText, { color: colors.muted }]}>
                ({formatCompact(reviews)})
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.comRatingRow}>
            <View style={styles.comStars}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < fullStars ? meta.ratingColor : "#D5D9D9"}
                  fill={i < fullStars ? meta.ratingColor : "#D5D9D9"}
                  strokeWidth={1}
                />
              ))}
            </View>
            <Text style={[styles.comRatingText, { color: colors.secondary }]}>
              {rating.toFixed(1)}
              {reviews != null ? (
                <Text style={{ color: colors.muted }}>
                  {` (${formatCompact(reviews)})`}
                </Text>
              ) : null}
            </Text>
            {feedbackPercent != null ? (
              <Text style={[styles.comRatingText, { color: colors.muted }]}>
                {` · ${feedbackPercent}% positive`}
              </Text>
            ) : null}
          </View>
        )
      ) : null}
      {seller || sold ? (
        <View style={styles.comSellerRow}>
          {seller ? (
            <Text style={[styles.comSeller, { color: colors.muted }]} numberOfLines={1}>
              {meta.sellerPrefix} {seller}
              {sellerFeedback ? ` ${sellerFeedback}` : ""}
            </Text>
          ) : null}
          {sold ? (
            <Text style={[styles.comSold, { color: colors.muted }]} numberOfLines={1}>
              {sold}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template K: LinkedIn post card ---------------- */

function LinkedInCard({
  headline,
  description,
  authorName,
  timeLabel,
  reposts,
  likes,
  avatar,
  hideCounts,
}: {
  headline: string | null;
  description: string;
  authorName: string;
  timeLabel: string;
  reposts: number | null;
  likes: number | null;
  avatar: string | null;
  hideCounts: boolean;
}) {
  const colors = useCardColors();
  const body = headline && headline !== description ? `${headline}\n${description}`.trim() : headline || description;
  return (
    <View style={[styles.li, { backgroundColor: colors.surface }]}>
      <View style={styles.liHeader}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.liAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.liAvatar, styles.liAvatarFallback]}>
            <Text style={styles.liAvatarText}>{getInitials(authorName)}</Text>
          </View>
        )}
        <View style={styles.liNames}>
          <Text style={[styles.liName, { color: colors.primary }]} numberOfLines={1}>
            {authorName}
          </Text>
          <Text style={[styles.liMeta, { color: colors.muted }]} numberOfLines={1}>
            {timeLabel}
          </Text>
        </View>
        <View style={styles.liBadge}>
          <Text style={styles.liBadgeText}>in</Text>
        </View>
      </View>
      <Text style={[styles.liBody, { color: colors.primary }]} numberOfLines={6}>
        {body}
      </Text>
      {!hideCounts && (reposts != null || likes != null) ? (
        <View style={[styles.liFooter, { borderTopColor: colors.divider }]}>
          {reposts != null ? (
            <View style={styles.liStat}>
              <Repeat2 size={13} color="#0A66C2" strokeWidth={2} />
              <Text style={[styles.liStatText, { color: colors.secondary }]}>{formatCompact(reposts)}</Text>
            </View>
          ) : null}
          {likes != null ? (
            <View style={styles.liStat}>
              <ThumbsUp size={13} color="#0A66C2" strokeWidth={2} />
              <Text style={[styles.liStatText, { color: colors.secondary }]}>{formatCompact(likes)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template L: Indeed job card ---------------- */

function IndeedCard({
  title,
  company,
  location,
  salary,
  jobType,
  image,
  posted,
}: {
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  jobType: string | null;
  image: string | null;
  posted: string | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.in, { backgroundColor: colors.surface }]}>
      <View style={styles.inProviderRow}>
        <View style={styles.inDot} />
        <Text style={[styles.inProvider, { color: colors.secondary }]}>Indeed</Text>
        {posted ? (
          <Text style={[styles.inPosted, { color: colors.muted }]} numberOfLines={1}>
            {posted}
          </Text>
        ) : null}
      </View>
      {image ? (
        <View style={styles.inImageWrap}>
          <CardMedia uri={image} style={styles.inImage} />
        </View>
      ) : null}
      <Text style={[styles.inTitle, { color: colors.primary }]} numberOfLines={2}>
        {title}
      </Text>
      {company ? (
        <View style={styles.inCompanyRow}>
          <Building2 size={13} color="#8A8A8A" strokeWidth={2} />
          <Text style={[styles.inCompany, { color: colors.secondary }]} numberOfLines={1}>
            {company}
          </Text>
        </View>
      ) : null}
      {location || jobType ? (
        <View style={styles.inMetaRow}>
          {location ? (
            <View style={styles.inMetaItem}>
              <MapPin size={12} color="#2557A7" strokeWidth={2} />
              <Text style={[styles.inMetaText, { color: colors.secondary }]} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
          {jobType ? (
            <View style={styles.inJobType}>
              <Text style={styles.inJobTypeText} numberOfLines={1}>
                {jobType}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      {salary ? (
        <View style={[styles.inSalaryRow, { borderTopColor: colors.divider }]}>
          <Text style={styles.inSalary} numberOfLines={1}>
            {salary}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template M: Zomato / Swiggy restaurant card ---------------- */

const RESTAURANT_BRAND: Record<"zomato" | "swiggy", { label: string; color: string }> = {
  zomato: { label: "Zomato", color: "#E23744" },
  swiggy: { label: "Swiggy", color: "#FC8019" },
};

function RestaurantCard({
  brand,
  title,
  image,
  cuisine,
  location,
  price,
  rating,
  reviews,
  eta,
}: {
  brand: "zomato" | "swiggy";
  title: string;
  image: string | null;
  cuisine: string | null;
  location: string | null;
  price: string | null;
  rating: number | null;
  reviews: number | null;
  eta: string | null;
}) {
  const colors = useCardColors();
  const meta = RESTAURANT_BRAND[brand];
  return (
    <View style={[styles.re, { backgroundColor: colors.surface }]}>
      <View style={styles.reProviderRow}>
        <View style={[styles.reDot, { backgroundColor: meta.color }]} />
        <Text style={[styles.reProvider, { color: colors.secondary }]}>{meta.label}</Text>
        {rating != null ? (
          <View style={styles.reRatingRow}>
            <Star size={11} color="#F59E0B" fill="#F59E0B" strokeWidth={1} />
            <Text style={[styles.reRatingText, { color: colors.primary }]}>{rating.toFixed(1)}</Text>
            {reviews != null ? (
              <Text style={[styles.reRatingCount, { color: colors.muted }]} numberOfLines={1}>
                ({formatCompact(reviews)})
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {image ? (
        <View style={styles.reImageWrap}>
          <CardMedia uri={image} style={styles.reImage} />
        </View>
      ) : null}
      <Text style={[styles.reTitle, { color: colors.primary }]} numberOfLines={1}>
        {title}
      </Text>
      {cuisine ? (
        <Text style={[styles.reCuisine, { color: colors.secondary }]} numberOfLines={1}>
          {cuisine}
        </Text>
      ) : null}
      {location || eta ? (
        <View style={styles.reMetaRow}>
          {location ? (
            <View style={styles.reMetaItem}>
              <MapPin size={12} color={meta.color} strokeWidth={2} />
              <Text style={[styles.reMetaText, { color: colors.secondary }]} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
          {eta ? (
            <View style={styles.reMetaItem}>
              <Clock size={12} color={meta.color} strokeWidth={2} />
              <Text style={[styles.reMetaText, { color: colors.secondary }]} numberOfLines={1}>
                {eta}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      {price ? (
        <Text style={[styles.rePrice, { color: meta.color }]} numberOfLines={1}>
          {price}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------------- Template N: Pinterest pin card ---------------- */

function PinterestCard({
  title,
  description,
  image,
  authorName,
}: {
  title: string;
  description: string;
  image: string | null;
  authorName: string;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.pi, { backgroundColor: colors.surface }]}>
      <View style={styles.piProviderRow}>
        <View style={styles.piDot} />
        <Text style={styles.piProvider}>Pinterest</Text>
      </View>
      {image ? (
        <View style={styles.piImageWrap}>
          <CardMedia uri={image} style={styles.piImage} />
        </View>
      ) : null}
      <Text style={[styles.piTitle, { color: colors.primary }]} numberOfLines={2}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.piDesc, { color: colors.secondary }]} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      <View style={[styles.piFooter, { borderTopColor: colors.divider }]}>
        <View style={styles.piAvatar}>
          <Text style={styles.piAvatarText}>{getInitials(authorName).charAt(0)}</Text>
        </View>
        <Text style={[styles.piAuthor, { color: colors.secondary }]} numberOfLines={1}>
          {authorName}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Template O: App Store / Play Store app card ---------------- */

function AppCard({
  platform,
  title,
  description,
  image,
  developer,
  category,
  downloads,
  price,
  rating,
  reviews,
}: {
  platform: "ios" | "android" | null;
  title: string;
  description: string;
  image: string | null;
  developer: string;
  category: string | null;
  downloads: string | null;
  price: string | null;
  rating: number | null;
  reviews: number | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.ap, { backgroundColor: colors.surface }]}>
      <View style={styles.apProviderRow}>
        <View style={[styles.apDot, { backgroundColor: platform === "android" ? "#00D084" : "#0A60FE" }]} />
        <Text style={[styles.apProvider, { color: colors.secondary }]}>{platform === "android" ? "Google Play" : "App Store"}</Text>
      </View>
      <View style={styles.apRow}>
        {image ? (
          <CardMedia uri={image} style={styles.apIcon} />
        ) : (
          <View style={[styles.apIcon, styles.apIconFallback]}>
            <Text style={styles.apIconText}>{getInitials(title).charAt(0)}</Text>
          </View>
        )}
        <View style={styles.apCol}>
          <Text style={[styles.apTitle, { color: colors.primary }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.apDeveloper, { color: colors.secondary }]} numberOfLines={1}>
            {developer}
          </Text>
          {downloads ? (
            <View style={styles.apDownloadRow}>
              <Download size={11} color="#555555" strokeWidth={2} />
              <Text style={[styles.apDownloadText, { color: colors.muted }]} numberOfLines={1}>
                {downloads}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {category ? (
        <View style={[styles.apCategoryChip, { backgroundColor: colors.subtle }]}>
          <Text style={[styles.apCategoryText, { color: colors.secondary }]} numberOfLines={1}>
            {category}
          </Text>
        </View>
      ) : null}
      {description ? (
        <Text style={[styles.apDesc, { color: colors.secondary }]} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      {price || rating != null ? (
        <View style={[styles.apFooter, { borderTopColor: colors.divider }]}>
          {price ? (
            <Text style={[styles.apPrice, { color: colors.primary }]} numberOfLines={1}>
              {price}
            </Text>
          ) : null}
          {rating != null ? (
            <View style={styles.apRatingRow}>
              <Star size={11} color="#111111" fill="#111111" strokeWidth={1} />
              <Text style={[styles.apRatingText, { color: colors.secondary }]}>
                {rating.toFixed(1)}
                {reviews != null ? ` (${formatCompact(reviews)})` : ""}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template P: Airbnb / stay listing card ---------------- */

function StayCard({
  title,
  location,
  host,
  price,
  rating,
  reviews,
  image,
}: {
  title: string;
  location: string;
  host: string | null;
  price: string | null;
  rating: number | null;
  reviews: number | null;
  image: string | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.sy, { backgroundColor: colors.surface }]}>
      <View style={styles.syProviderRow}>
        <View style={styles.syDot} />
        <Text style={[styles.syProvider, { color: colors.secondary }]}>Airbnb</Text>
        {rating != null ? (
          <View style={styles.syRatingRow}>
            <Star size={11} color="#111111" fill="#111111" strokeWidth={1} />
            <Text style={[styles.syRatingText, { color: colors.secondary }]}>
              {rating.toFixed(1)}
              {reviews != null ? ` (${formatCompact(reviews)})` : ""}
            </Text>
          </View>
        ) : null}
      </View>
      {image ? (
        <View style={styles.syImageWrap}>
          <CardMedia uri={image} style={styles.syImage} />
        </View>
      ) : null}
      <Text style={[styles.syTitle, { color: colors.primary }]} numberOfLines={2}>
        {title}
      </Text>
      {location ? (
        <View style={styles.syMetaRow}>
          <MapPin size={12} color="#FF385C" strokeWidth={2} />
          <Text style={[styles.syMetaText, { color: colors.secondary }]} numberOfLines={1}>
            {location}
          </Text>
        </View>
      ) : null}
      {host ? (
        <Text style={[styles.syHost, { color: colors.muted }]} numberOfLines={1}>
          Hosted by {host}
        </Text>
      ) : null}
      {price ? (
        <Text style={[styles.syPrice, { color: colors.primary }]} numberOfLines={1}>
          {price}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------------- Template Q: Steam game card ---------------- */

function GameCard({
  title,
  description,
  image,
  genre,
  releaseDate,
  metacritic,
  price,
}: {
  title: string;
  description: string;
  image: string | null;
  genre: string | null;
  releaseDate: string | null;
  metacritic: number | null;
  price: string | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.gm, { backgroundColor: colors.surface }]}>
      <View style={styles.gmProviderRow}>
        <View style={styles.gmDot} />
        <Text style={[styles.gmProvider, { color: colors.muted }]}>Steam</Text>
        {metacritic != null ? (
          <View style={styles.gmMetaChip}>
            <Text style={styles.gmMetaText}>{Math.round(metacritic)}</Text>
          </View>
        ) : null}
      </View>
      {image ? (
        <View style={styles.gmImageWrap}>
          <CardMedia uri={image} style={styles.gmImage} />
        </View>
      ) : null}
      <Text style={[styles.gmTitle, { color: colors.primary }]} numberOfLines={2}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.gmDesc, { color: colors.secondary }]} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
      {genre || releaseDate ? (
        <View style={styles.gmMetaRow}>
          {genre ? (
            <Text style={styles.gmGenre} numberOfLines={1}>
              {genre}
            </Text>
          ) : null}
          {releaseDate ? (
            <Text style={[styles.gmRelease, { color: colors.muted }]} numberOfLines={1}>
              Out {releaseDate}
            </Text>
          ) : null}
        </View>
      ) : null}
      {price ? (
        <Text style={styles.gmPrice} numberOfLines={1}>
          {price}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------------- Template R: Book card ---------------- */

function BookCard({
  title,
  authorName,
  pages,
  rating,
  reviews,
  image,
}: {
  title: string;
  authorName: string;
  pages: number | null;
  rating: number | null;
  reviews: number | null;
  image: string | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.bk, { backgroundColor: colors.surface }]}>
      <View style={styles.bkProviderRow}>
        <View style={styles.bkDot} />
        <Text style={[styles.bkProvider, { color: colors.muted }]}>Book</Text>
      </View>
      <View style={styles.bkRow}>
        {image ? (
          <CardMedia uri={image} style={styles.bkCover} />
        ) : (
          <View style={[styles.bkCover, styles.bkCoverFallback]}>
            <BookOpen size={24} color="#754C1E" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.bkCol}>
          <Text style={[styles.bkTitle, { color: colors.primary }]} numberOfLines={3}>
            {title}
          </Text>
          <Text style={[styles.bkAuthor, { color: colors.secondary }]} numberOfLines={1}>
            {authorName}
          </Text>
        </View>
      </View>
      {rating != null || pages != null ? (
        <View style={[styles.bkMetaRow, { borderTopColor: colors.divider }]}>
          {rating != null ? (
            <View style={styles.bkRating}>
              <Star size={12} color="#B45309" fill="#B45309" strokeWidth={1} />
              <Text style={[styles.bkRatingText, { color: colors.secondary }]}>
                {rating.toFixed(1)}
                {reviews != null ? ` (${formatCompact(reviews)})` : ""}
              </Text>
            </View>
          ) : null}
          {pages != null ? (
            <Text style={[styles.bkPages, { color: colors.muted }]}>{pages} pages</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template S: Product Hunt launch card ---------------- */

function LaunchCard({
  title,
  tagline,
  maker,
  upvotes,
}: {
  title: string;
  tagline: string | null;
  maker: string;
  upvotes: number | null;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.lc, { backgroundColor: colors.surface }]}>
      <View style={styles.lcProviderRow}>
        <View style={styles.lcDot} />
        <Text style={styles.lcProvider}>Product Hunt</Text>
      </View>
      <View style={styles.lcTitleRow}>
        <ArrowBigUp size={32} color="#FF6154" strokeWidth={2} />
        <Text style={[styles.lcTitle, { color: colors.primary }]} numberOfLines={2}>
          {title}
        </Text>
      </View>
      {tagline ? (
        <Text style={[styles.lcTagline, { color: colors.secondary }]} numberOfLines={2}>
          {tagline}
        </Text>
      ) : null}
      <View style={[styles.lcFooter, { borderTopColor: colors.divider }]}>
        <View style={styles.lcAvatar}>
          <Text style={styles.lcAvatarText}>{getInitials(maker).charAt(0)}</Text>
        </View>
        <Text style={[styles.lcMaker, { color: colors.secondary }]} numberOfLines={1}>
          {maker}
        </Text>
        <View style={styles.lcVotes}>
          <ArrowBigUp size={13} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.lcVotesText}>{upvotes != null ? formatCompact(upvotes) : "Vote"}</Text>
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T1: YouTube Music card ---------------- */

function YtMusicCard({
  title,
  artist,
  cover,
  kind,
}: {
  title: string;
  artist: string;
  cover: string | null;
  kind: string | null;
}) {
  return (
    <View style={styles.yi}>
      <View style={styles.yiHeader}>
        <View style={styles.yiDot} />
        <Text style={styles.yiBrand} numberOfLines={1}>
          YouTube Music
        </Text>
        {kind ? <Text style={styles.yiKind}>{kind}</Text> : null}
      </View>
      <View style={styles.yiRow}>
        {cover ? (
          <CardMedia uri={cover} style={styles.yiCover} />
        ) : (
          <View style={[styles.yiCover, styles.yiCoverFallback]}>
            <AudioLines size={22} color="#FF0033" strokeWidth={2} />
          </View>
        )}
        <View style={styles.yiCol}>
          <Text style={styles.yiTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.yiArtist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T2: JioSaavn card ---------------- */

function JioSaavnCard({
  title,
  artist,
  cover,
  kind,
  durationSec,
}: {
  title: string;
  artist: string;
  cover: string | null;
  kind: string | null;
  durationSec: number | null;
}) {
  const durationLabel =
    durationSec != null && durationSec > 0 ? formatDuration(durationSec) : null;
  return (
    <View style={styles.js}>
      <View style={styles.jsHeader}>
        <View style={styles.jsDot} />
        <Text style={styles.jsBrand} numberOfLines={1}>
          JioSaavn
        </Text>
        {kind ? <Text style={styles.jsKind}>{kind}</Text> : null}
      </View>
      <View style={styles.jsRow}>
        {cover ? (
          <CardMedia uri={cover} style={styles.jsCover} />
        ) : (
          <View style={[styles.jsCover, styles.jsCoverFallback]}>
            <Radio size={24} color="#FF4D00" strokeWidth={1.6} />
          </View>
        )}
        <View style={styles.jsCol}>
          <Text style={styles.jsTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.jsArtist} numberOfLines={1}>
            {artist}
          </Text>
          {durationLabel ? (
            <View style={styles.jsTimeRow}>
              <Clock size={11} color="#8E8C90" strokeWidth={2} />
              <Text style={styles.jsTime}>{durationLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.jsBar}>
        <View style={styles.jsBarFill} />
      </View>
    </View>
  );
}

/* ---------------- Template T3: Gaana card ---------------- */

function GaanaCard({
  title,
  artist,
  cover,
  kind,
}: {
  title: string;
  artist: string;
  cover: string | null;
  kind: string | null;
}) {
  return (
    <View style={styles.gn}>
      <View style={styles.gnHeader}>
        <View style={styles.gnDot} />
        <Text style={styles.gnBrand} numberOfLines={1}>
          Gaana
        </Text>
        {kind ? <Text style={styles.gnKind}>{kind}</Text> : null}
      </View>
      <View style={styles.gnRow}>
        {cover ? (
          <CardMedia uri={cover} style={styles.gnCover} />
        ) : (
          <View style={[styles.gnCover, styles.gnCoverFallback]}>
            <Disc size={24} color="#22D37A" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.gnCol}>
          <Text style={styles.gnTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.gnArtist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>
      <View style={styles.gnFooter}>
        <AudioWaveform size={16} color="#22D37A" strokeWidth={2} />
        <Text style={styles.gnFooterText}>Streaming on Gaana</Text>
      </View>
    </View>
  );
}

/* ---------------- Template T4: Apple Music card ---------------- */

function AppleMusicCard({
  title,
  artist,
  cover,
  kind,
}: {
  title: string;
  artist: string;
  cover: string | null;
  kind: string | null;
}) {
  return (
    <View style={styles.am}>
      <View style={styles.amHeader}>
        <Music size={14} color="#FA233B" fill="#FA233B" strokeWidth={2} />
        <Text style={styles.amBrand} numberOfLines={1}>
          APPLE MUSIC
        </Text>
        {kind ? <Text style={styles.amKind}>{kind}</Text> : null}
      </View>
      {cover ? (
        <CardMedia uri={cover} style={styles.amArt} />
      ) : (
        <View style={[styles.amArt, styles.amArtFallback]}>
          <Music size={38} color="#FA233B" strokeWidth={1.4} />
        </View>
      )}
      <Text style={styles.amTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.amArtist} numberOfLines={1}>
        {artist}
      </Text>
      <View style={styles.amFooter}>
        <View style={styles.amFooterDot} />
        <Text style={styles.amFooterText}>Apple Music</Text>
      </View>
    </View>
  );
}

/* ---------------- Template T5: Netflix card ---------------- */

function NetflixCard({
  title,
  tagline,
  image,
  meta,
}: {
  title: string;
  tagline: string;
  image: string | null;
  meta: string;
}) {
  return (
    <View style={styles.nf}>
      <Text style={styles.nfWordmark}>NETFLIX</Text>
      {image ? (
        <View style={styles.nfHero}>
          <Image source={{ uri: image }} style={styles.nfHeroFill} resizeMode="cover" />
        </View>
      ) : (
        <View style={[styles.nfHero, styles.nfHeroFallback]}>
          <Tv size={26} color="#E50914" strokeWidth={1.6} />
        </View>
      )}
      <Text style={styles.nfTitle} numberOfLines={2}>
        {title}
      </Text>
      {tagline ? (
        <Text style={styles.nfTagline} numberOfLines={2}>
          {tagline}
        </Text>
      ) : null}
      <View style={styles.nfMetaRow}>
        <Text style={styles.nfMeta} numberOfLines={1}>
          {meta}
        </Text>
        <View style={styles.nfMatch}>
          <Text style={styles.nfMatchText}>N Series</Text>
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T6: Amazon Prime Video card ---------------- */

function PrimeVideoCard({
  title,
  tagline,
  image,
  meta,
  rating,
}: {
  title: string;
  tagline: string;
  image: string | null;
  meta: string;
  rating: number | null;
}) {
  return (
    <View style={styles.pv}>
      <View style={styles.pvThumbWrap}>
        {image ? (
          <CardMedia uri={image} style={styles.pvThumb} />
        ) : (
          <View style={[styles.pvThumb, styles.pvThumbFallback]}>
            <MonitorPlay size={26} color="#00A8E1" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.pvPlay}>
          <Play size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.2} />
        </View>
        <Text style={styles.pvUhd}>4K UHD</Text>
      </View>
      <Text style={styles.pvTitle} numberOfLines={2}>
        {title}
      </Text>
      {tagline ? (
        <Text style={styles.pvTagline} numberOfLines={2}>
          {tagline}
        </Text>
      ) : null}
      <View style={styles.pvMetaRow}>
        <Text style={styles.pvMeta} numberOfLines={1}>
          {meta}
        </Text>
        {rating != null ? (
          <Text style={styles.pvRating}>{rating.toFixed(1)} ★</Text>
        ) : null}
      </View>
      <Text style={styles.pvWordmark}>prime video</Text>
    </View>
  );
}

/* ---------------- Template T7: Disney+ Hotstar card ---------------- */

function HotstarCard({
  title,
  tagline,
  image,
  meta,
  age,
}: {
  title: string;
  tagline: string;
  image: string | null;
  meta: string;
  age: string;
}) {
  return (
    <View style={styles.hs}>
      <View style={styles.hsBannerWrap}>
        {image ? (
          <CardMedia uri={image} style={styles.hsBanner} />
        ) : (
          <View style={[styles.hsBanner, styles.hsBannerFallback]}>
            <Film size={26} color="#2FC9E0" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.hsAgeChip}>
          <Text style={styles.hsAgeText}>{age ? age.slice(0, 3).toUpperCase() : "U/A"}</Text>
        </View>
      </View>
      <Text style={styles.hsTitle} numberOfLines={2}>
        {title}
      </Text>
      {tagline ? (
        <Text style={styles.hsTagline} numberOfLines={2}>
          {tagline}
        </Text>
      ) : null}
      <View style={styles.hsFooter}>
        <View style={styles.hsDot} />
        <Text style={styles.hsBrand} numberOfLines={1}>
          Hotstar
        </Text>
        <Text style={styles.hsMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Template T8: Kuku FM card ---------------- */

function KukuFmCard({
  title,
  host,
  show,
  durationSec,
}: {
  title: string;
  host: string;
  show: string;
  durationSec: number | null;
}) {
  const durationLabel =
    durationSec != null && durationSec > 0 ? formatDuration(durationSec) : null;
  return (
    <View style={styles.kf}>
      <View style={styles.kfHeader}>
        <View style={styles.kfDot} />
        <Text style={styles.kfBrand} numberOfLines={1}>
          Kuku FM
        </Text>
        <Text style={styles.kfEpisode}>EPISODE</Text>
      </View>
      <Text style={styles.kfTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.kfHost} numberOfLines={1}>
        {host}
      </Text>
      {show ? (
        <Text style={styles.kfShow} numberOfLines={2}>
          {show}
        </Text>
      ) : null}
      <View style={styles.kfWaveRow}>
        <AudioWaveform size={18} color="#FF8A2B" strokeWidth={2} />
        {durationLabel ? <Text style={styles.kfDuration}>{durationLabel}</Text> : null}
        <View style={styles.kfPlay}>
          <Play size={12} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T9: Apple Podcasts card ---------------- */

function ApplePodcastsCard({
  title,
  show,
  cover,
  durationSec,
}: {
  title: string;
  show: string;
  cover: string | null;
  durationSec: number | null;
}) {
  const durationLabel =
    durationSec != null && durationSec > 0 ? formatDuration(durationSec) : null;
  return (
    <View style={styles.pod}>
      <View style={styles.podHeader}>
        <View style={styles.podDot} />
        <Text style={styles.podBrand} numberOfLines={1}>
          APPLE PODCASTS
        </Text>
      </View>
      <View style={styles.podRow}>
        {cover ? (
          <CardMedia uri={cover} style={styles.podCover} />
        ) : (
          <View style={[styles.podCover, styles.podCoverFallback]}>
            <Headphones size={22} color="#8B3DFF" strokeWidth={1.8} />
          </View>
        )}
        <View style={styles.podCol}>
          <Text style={styles.podEpisode}>EPISODE</Text>
          <Text style={styles.podTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.podShow} numberOfLines={1}>
            {show}
          </Text>
        </View>
      </View>
      <View style={styles.podFooter}>
        {durationLabel ? <Text style={styles.podDuration}>{durationLabel}</Text> : null}
        <View style={styles.podPlay}>
          <Play size={12} color="#8B3DFF" fill="#8B3DFF" strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T10: Pocket FM card ---------------- */

function PocketFmCard({
  title,
  host,
  show,
  image,
  durationSec,
}: {
  title: string;
  host: string;
  show: string;
  image: string | null;
  durationSec: number | null;
}) {
  const durationLabel =
    durationSec != null && durationSec > 0 ? formatDuration(durationSec) : null;
  return (
    <View style={styles.pf}>
      {image ? (
        <CardMedia uri={image} style={styles.pfBanner} />
      ) : (
        <View style={[styles.pfBanner, styles.pfBannerFallback]}>
          <Headphones size={26} color="#00C48C" strokeWidth={1.6} />
        </View>
      )}
      <View style={styles.pfChip}>
        <Text style={styles.pfChipText}>AUDIO SERIES</Text>
      </View>
      <Text style={styles.pfTitle} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.pfMetaRow}>
        <Text style={styles.pfHost} numberOfLines={1}>
          {host}
        </Text>
        {show ? (
          <Text style={styles.pfShow} numberOfLines={1}>
            {show}
          </Text>
        ) : null}
      </View>
      <View style={styles.pfWaveRow}>
        <AudioWaveform size={18} color="#00C48C" strokeWidth={2} />
        {durationLabel ? <Text style={styles.pfDuration}>{durationLabel}</Text> : null}
        <View style={styles.pfPlay}>
          <Play size={12} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>
      <Text style={styles.pfBrand}>Pocket FM</Text>
    </View>
  );
}

/* ---------------- Template T11: Kindle card ---------------- */

function KindleCard({
  title,
  authorName,
  pages,
  rating,
  reviews,
  image,
}: {
  title: string;
  authorName: string;
  pages: number | null;
  rating: number | null;
  reviews: number | null;
  image: string | null;
}) {
  return (
    <View style={styles.kd}>
      <View style={styles.kdProviderRow}>
        <View style={styles.kdDot} />
        <Text style={styles.kdProvider}>Kindle Store</Text>
      </View>
      <View style={styles.kdRow}>
        {image ? (
          <CardMedia uri={image} style={styles.kdCover} />
        ) : (
          <View style={[styles.kdCover, styles.kdCoverFallback]}>
            <BookMarked size={24} color="#FF9900" strokeWidth={1.6} />
          </View>
        )}
        <View style={styles.kdCol}>
          <Text style={styles.kdTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.kdAuthor} numberOfLines={1}>
            {authorName}
          </Text>
          {pages != null ? <Text style={styles.kdPages}>{pages} pages</Text> : null}
        </View>
      </View>
      {rating != null || reviews != null ? (
        <View style={styles.kdMetaRow}>
          <Star size={12} color="#B45309" fill="#B45309" strokeWidth={1} />
          <Text style={styles.kdRatingText}>
            {rating != null ? rating.toFixed(1) : "—"}
            {reviews != null ? ` (${formatCompact(reviews)})` : ""}
          </Text>
          <Text style={styles.kdKindle}>amazon kindle</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- Template T12: Wattpad card ---------------- */

function WattpadCard({
  title,
  authorName,
  rating,
  reviews,
  image,
}: {
  title: string;
  authorName: string;
  rating: number | null;
  reviews: number | null;
  image: string | null;
}) {
  return (
    <View style={styles.wt}>
      <View style={styles.wtProviderRow}>
        <View style={styles.wtDot} />
        <Text style={styles.wtProvider}>Wattpad</Text>
      </View>
      <View style={styles.wtRow}>
        {image ? (
          <CardMedia uri={image} style={styles.wtCover} />
        ) : (
          <View style={[styles.wtCover, styles.wtCoverFallback]}>
            <Scroll size={24} color="#00B96B" strokeWidth={1.6} />
          </View>
        )}
        <View style={styles.wtCol}>
          <Text style={styles.wtTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.wtAuthor} numberOfLines={1}>
            {authorName}
          </Text>
          {rating != null || reviews != null ? (
            <View style={styles.wtRatingRow}>
              <Star size={11} color="#00B96B" fill="#00B96B" strokeWidth={1} />
              <Text style={styles.wtRatingText}>
                {rating != null ? rating.toFixed(1) : "—"}
                {reviews != null ? ` · ${formatCompact(reviews)} reads` : ""}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T13: Pratilipi card ---------------- */

function PratilipiCard({
  title,
  authorName,
  excerpt,
  image,
}: {
  title: string;
  authorName: string;
  excerpt: string;
  image: string | null;
}) {
  return (
    <View style={styles.pr}>
      <View style={styles.prProviderRow}>
        <View style={styles.prDot} />
        <Text style={styles.prProvider}>Pratilipi</Text>
      </View>
      <Text style={styles.prTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.prAuthor} numberOfLines={1}>
        {authorName}
      </Text>
      {excerpt ? (
        <Text style={styles.prExcerpt} numberOfLines={2}>
          {excerpt}
        </Text>
      ) : null}
      <View style={styles.prBottomRow}>
        {image ? (
          <CardMedia uri={image} style={styles.prCover} />
        ) : (
          <View style={[styles.prCover, styles.prCoverFallback]}>
            <BookOpen size={22} color="#FF6B2C" strokeWidth={1.6} />
          </View>
        )}
      </View>
    </View>
  );
}

/* ---------------- Template T14: Webtoon card ---------------- */

function WebtoonCard({
  title,
  authorName,
  rating,
  reviews,
  image,
}: {
  title: string;
  authorName: string;
  rating: number | null;
  reviews: number | null;
  image: string | null;
}) {
  return (
    <View style={styles.wb}>
      <Text style={styles.wbWordmark}>WEBTOON</Text>
      <View style={styles.wbRow}>
        {image ? (
          <CardMedia uri={image} style={styles.wbCover} />
        ) : (
          <View style={[styles.wbCover, styles.wbCoverFallback]}>
            <Sparkles size={22} color="#00DC64" strokeWidth={1.8} />
          </View>
        )}
        <View style={styles.wbCol}>
          <Text style={styles.wbTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.wbAuthor} numberOfLines={1}>
            {authorName}
          </Text>
          {rating != null || reviews != null ? (
            <View style={styles.wbLikesRow}>
              <Heart size={11} color="#00DC64" fill="#00DC64" strokeWidth={1.5} />
              <Text style={styles.wbLikesText}>
                {rating != null ? `${rating.toFixed(1)} ★` : ""}
                {reviews != null ? ` · ${formatCompact(reviews)}` : ""}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template T15: Medium article card ---------------- */

function MediumCard({
  title,
  authorName,
  minutes,
  excerpt,
  dateLabel,
  image,
  hideReadTime,
}: {
  title: string;
  authorName: string;
  minutes: number;
  excerpt: string;
  dateLabel: string;
  image: string | null;
  hideReadTime?: boolean;
}) {
  return (
    <View style={styles.md}>
      <View style={styles.mdProviderRow}>
        <View style={styles.mdDot} />
        <Text style={styles.mdProvider}>Medium</Text>
      </View>
      {image ? (
        <View style={styles.mdHeroWrap}>
          <CardMedia uri={image} style={styles.mdHero} />
        </View>
      ) : null}
      <Text style={styles.mdTitle} numberOfLines={3}>
        {title}
      </Text>
      <Text style={styles.mdAuthor} numberOfLines={1}>
        {authorName}
      </Text>
      {excerpt ? (
        <Text style={styles.mdExcerpt} numberOfLines={2}>
          {excerpt}
        </Text>
      ) : null}
      <View style={styles.mdFooterRow}>
        <Text style={styles.mdFooterText} numberOfLines={1}>
          {hideReadTime
            ? dateLabel
            : `${dateLabel ? `${dateLabel} · ` : ""}${minutes} min read`}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Generic / default article card ---------------- */

/**
 * Adaptive default card for generic (non-platform) links.
 *
 * - Any measurable image: laid out top-down as a full-width hero, preserving
 *   its shape. Portrait images get more height than landscape images.
 * - No image or an image that cannot be measured: compact text-first layout.
 */
function DynamicCard({
  isStory,
  cardWidth,
  title,
  excerpt,
  authorName,
  minutes,
  showReadTime,
  image,
  favicon,
}: {
  isStory: boolean;
  cardWidth: number;
  title: string;
  excerpt: string;
  authorName: string;
  minutes: number;
  showReadTime: boolean;
  image: string | null;
  favicon: string | null;
}) {
  const colors = useCardColors();
  const size = useImageSize(image);
  const hasSize = size.loaded && size.width > 0 && size.height > 0;

  const footer = (
    <View style={styles.dynFooter}>
      {favicon ? (
        <Image source={{ uri: favicon }} style={styles.dynAvatar} resizeMode="cover" />
      ) : (
        <View style={[styles.dynAvatar, { backgroundColor: colors.subtle }]}>
          <Text style={[styles.dynAvatarText, { color: colors.secondary }]}>{getInitials(authorName)}</Text>
        </View>
      )}
      <Text style={[styles.dynAuthor, { color: colors.primary }]} numberOfLines={1}>
        {authorName || "Link"}
      </Text>
      {showReadTime ? (
        <Text style={[styles.dynReadTime, { color: colors.muted }]} numberOfLines={1}>
          {`${minutes} min read`}
        </Text>
      ) : null}
    </View>
  );

  if (image && hasSize) {
    const heroRatio = size.width / size.height;
    // Actual usable card width: shell width − borders − 20px padding each side.
    const contentWidth = Math.max(120, cardWidth * CARD_W_RATIO - 42);
    // Keep enough room for metadata while allowing portrait assets to grow.
    const heroMax = Math.max(160, contentWidth * (heroRatio < 1 ? 1.05 : 0.72));
    const heroHeight = Math.min(contentWidth / heroRatio, heroMax);

    return (
      <View style={styles.dyn}>
        <View style={[styles.dynHeroWrap, { height: heroHeight }]}>
          <Image source={{ uri: image }} style={styles.dynHero} resizeMode="contain" />
        </View>
        <Text style={[styles.dynTitle, styles.dynTitleBelowHero, { color: colors.primary }]} numberOfLines={2}>
          {title}
        </Text>
        {excerpt ? (
          <Text style={[styles.dynExcerpt, styles.dynExcerptBelowHero, { color: colors.secondary }]} numberOfLines={2}>
            {excerpt}
          </Text>
        ) : null}
        {footer}
      </View>
    );
  }

  return (
    <View style={styles.dyn}>
      <Text style={[styles.dynTitle, { color: colors.primary }]} numberOfLines={isStory ? 3 : 2}>
        {title}
      </Text>
      {excerpt ? (
        <Text style={[styles.dynExcerpt, { color: colors.secondary }]} numberOfLines={isStory ? 2 : 3}>
          {excerpt}
        </Text>
      ) : null}
      {image ? (
        <View style={styles.dynThumbWrap}>
          <Image source={{ uri: image }} style={styles.dynThumb} resizeMode="cover" />
        </View>
      ) : null}
      {footer}
    </View>
  );
}

/* ---------------- Blog / long-form article cards ---------------- */

function BlogByline({
  authorName,
  avatar,
  meta,
}: {
  authorName: string;
  avatar?: string | null;
  meta: string;
}) {
  const colors = useCardColors();
  return (
    <View style={styles.blogByline}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.blogAvatar} resizeMode="cover" />
      ) : (
        <View style={[styles.blogAvatar, styles.blogAvatarFallback, { backgroundColor: colors.subtle }]}>
          <Text style={[styles.blogAvatarText, { color: colors.secondary }]}>{getInitials(authorName)}</Text>
        </View>
      )}
      <Text style={[styles.blogAuthor, { color: colors.primary }]} numberOfLines={1}>
        {authorName}
      </Text>
      {meta ? (
        <Text style={[styles.blogMeta, { color: colors.muted }]} numberOfLines={1}>
          · {meta}
        </Text>
      ) : null}
    </View>
  );
}

function BlogTagRow({ tags }: { tags: string[] | null }) {
  const colors = useCardColors();
  if (!tags?.length) return null;
  return (
    <View style={styles.blogTagsRow}>
      {tags.slice(0, 4).map((tag) => (
        <View key={tag} style={[styles.blogTag, { backgroundColor: colors.subtle }]}>
          <Text style={[styles.blogTagText, { color: colors.secondary }]} numberOfLines={1}>
            {tag}
          </Text>
        </View>
      ))}
    </View>
  );
}

function BlogspotCard({
  title,
  blog,
  authorName,
  excerpt,
  image,
  dateLabel,
  minutes,
  tags,
  hideReadTime,
}: {
  title: string;
  blog: string;
  authorName: string;
  excerpt: string;
  image: string | null;
  dateLabel: string;
  minutes: number;
  tags: string[] | null;
  hideReadTime?: boolean;
}) {
  const colors = useCardColors();
  const meta = [
    dateLabel,
    hideReadTime ? "" : `${minutes} min read`,
  ].filter(Boolean).join(" · ");
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      <View style={styles.blogBrandRow}>
        <View style={[styles.blogBrandMark, { backgroundColor: "#F57C00" }]}>
          <Text style={styles.blogBrandMarkText}>B</Text>
        </View>
        <Text style={[styles.blogBrand, { color: "#F57C00" }]} numberOfLines={1}>
          {blog}
        </Text>
      </View>
      {image ? (
        <View style={styles.blogHeroWrap}>
          <CardMedia uri={image} style={styles.blogHero} />
        </View>
      ) : null}
      <Text style={[styles.blogTitle, styles.blogTitleSerif, { color: colors.primary }]} numberOfLines={2}>
        {title}
      </Text>
      {excerpt ? (
        <Text style={[styles.blogSubtitle, { color: colors.secondary }]} numberOfLines={2}>
          {excerpt}
        </Text>
      ) : null}
      <BlogByline authorName={authorName} meta={meta} />
      <BlogTagRow tags={tags} />
    </View>
  );
}

function DevToCard({
  title,
  authorName,
  excerpt,
  image,
  dateLabel,
  minutes,
  tags,
  hideReadTime,
}: {
  title: string;
  authorName: string;
  excerpt: string;
  image: string | null;
  dateLabel: string;
  minutes: number;
  tags: string[] | null;
  hideReadTime?: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      <View style={styles.blogBrandRow}>
        <View style={[styles.blogBrandMark, { backgroundColor: "#0A0A0A", width: 34, borderRadius: 4 }]}>
          <Text style={[styles.blogBrandMarkText, { fontSize: 11, letterSpacing: 0.5 }]}>DEV</Text>
        </View>
        <Text style={[styles.blogBrand, { color: colors.muted }]} numberOfLines={1}>
          DEV Community
        </Text>
      </View>
      <Text style={[styles.blogTitle, { color: colors.primary }]} numberOfLines={3}>
        {title}
      </Text>
      {image ? (
        <View style={styles.blogHeroWrap}>
          <CardMedia uri={image} style={styles.blogHero} />
        </View>
      ) : null}
      {excerpt ? (
        <Text style={[styles.blogSubtitle, { color: colors.secondary }]} numberOfLines={2}>
          {excerpt}
        </Text>
      ) : null}
      <BlogByline
        authorName={authorName}
        meta={[dateLabel, hideReadTime ? "" : `${minutes} min read`].filter(Boolean).join(" · ")}
      />
      <View style={styles.blogTagsRow}>
        {(tags || []).slice(0, 4).map((tag) => (
          <View key={tag} style={[styles.blogTag, { backgroundColor: colors.subtle }]}>
            <Text style={[styles.blogTagText, { color: "#3B49DF" }]} numberOfLines={1}>
              #{tag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function XArticleCard({
  headline,
  excerpt,
  authorName,
  handle,
  verified,
  avatar,
  image,
  dateLabel,
  views,
  hideCounts,
}: {
  headline: string;
  excerpt: string;
  authorName: string;
  handle: string | null;
  verified: boolean;
  avatar: string | null;
  image: string | null;
  dateLabel: string;
  views: number | null;
  hideCounts: boolean;
}) {
  const colors = useCardColors();
  const body = excerpt && excerpt !== headline ? excerpt : "";
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      {image ? (
        <View style={styles.xaHeroWrap}>
          <CardMedia uri={image} style={styles.xaHero} />
          <View style={styles.xaBadge}>
            <Text style={styles.xaBadgeText}>Article</Text>
          </View>
        </View>
      ) : (
        <View style={styles.xaBadgeStandalone}>
          <Text style={styles.xaBadgeText}>Article</Text>
        </View>
      )}
      <Text style={[styles.xaHeadline, { color: colors.primary }]} numberOfLines={3}>
        {headline}
      </Text>
      {body ? (
        <Text style={[styles.blogSubtitle, { color: colors.secondary }]} numberOfLines={2}>
          {body}
        </Text>
      ) : null}
      <View style={styles.blogByline}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.blogAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.blogAvatar, styles.blogAvatarFallback, { backgroundColor: colors.subtle }]}>
            <Text style={[styles.blogAvatarText, { color: colors.secondary }]}>{getInitials(authorName)}</Text>
          </View>
        )}
        <Text style={[styles.blogAuthor, { color: colors.primary }]} numberOfLines={1}>
          {authorName}
        </Text>
        {verified ? <Check size={13} color="#1D9BF0" strokeWidth={3} /> : null}
        {handle ? (
          <Text style={[styles.blogMeta, { color: colors.muted }]} numberOfLines={1}>
            @{handle}
          </Text>
        ) : null}
      </View>
      <View style={styles.blogFooterRow}>
        {!hideCounts && views != null ? (
          <View style={styles.blogStat}>
            <Eye size={13} color={colors.muted} strokeWidth={2} />
            <Text style={[styles.blogStatText, { color: colors.muted }]}>{formatCompact(views)}</Text>
          </View>
        ) : null}
        {dateLabel ? (
          <Text style={[styles.blogStatText, { color: colors.muted }]} numberOfLines={1}>
            {dateLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function LinkedArticleCard({
  headline,
  authorName,
  avatar,
  image,
  dateLabel,
  likes,
  comments,
  minutes,
  hideCounts,
  hideReadTime,
}: {
  headline: string;
  authorName: string;
  avatar: string | null;
  image: string | null;
  dateLabel: string;
  likes: number | null;
  comments: number | null;
  minutes: number;
  hideCounts: boolean;
  hideReadTime?: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      <View style={styles.blogBrandRow}>
        <View style={[styles.liMark]}>
          <Text style={styles.liMarkText}>in</Text>
        </View>
        <Text style={[styles.blogBrand, { color: "#0A66C2" }]}>LinkedIn</Text>
      </View>
      <View style={styles.blogByline}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.blogAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.blogAvatar, styles.blogAvatarFallback, { backgroundColor: "#0A66C2" }]}>
            <Text style={[styles.blogAvatarText, { color: "#FFFFFF" }]}>{getInitials(authorName)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.blogAuthor, { color: colors.primary }]} numberOfLines={1}>
            {authorName}
          </Text>
          {dateLabel ? (
            <Text style={[styles.blogMeta, { color: colors.muted }]} numberOfLines={1}>
              {dateLabel}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={[styles.laKicker]}>Article</Text>
      <Text style={[styles.blogTitle, { color: colors.primary }]} numberOfLines={3}>
        {headline}
      </Text>
      {image ? (
        <View style={styles.blogHeroWrap}>
          <CardMedia uri={image} style={styles.blogHero} />
        </View>
      ) : null}
      <View style={styles.blogFooterRow}>
        {!hideCounts && likes != null ? (
          <View style={styles.blogStat}>
            <ThumbsUp size={13} color="#0A66C2" strokeWidth={2} />
            <Text style={[styles.blogStatText, { color: colors.muted }]}>{formatCompact(likes)}</Text>
          </View>
        ) : null}
        {!hideCounts && comments != null ? (
          <View style={styles.blogStat}>
            <MessageCircle size={13} color={colors.muted} strokeWidth={2} />
            <Text style={[styles.blogStatText, { color: colors.muted }]}>{formatCompact(comments)}</Text>
          </View>
        ) : null}
        {!hideReadTime ? (
          <View style={styles.blogStat}>
            <Clock size={13} color={colors.muted} strokeWidth={2} />
            <Text style={[styles.blogStatText, { color: colors.muted }]}>{minutes} min read</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SubstackCard({
  title,
  publication,
  authorName,
  subtitle,
  image,
  dateLabel,
  likes,
  comments,
  minutes,
  hideCounts,
  hideReadTime,
}: {
  title: string;
  publication: string;
  authorName: string;
  subtitle: string;
  image: string | null;
  dateLabel: string;
  likes: number | null;
  comments: number | null;
  minutes: number;
  hideCounts: boolean;
  hideReadTime?: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      <View style={styles.blogBrandRow}>
        <Text style={[styles.substackWordmark]}>Substack</Text>
        <Text style={[styles.blogBrand, { color: colors.muted }]} numberOfLines={1}>
          {publication}
        </Text>
      </View>
      {image ? (
        <View style={styles.blogHeroWrap}>
          <CardMedia uri={image} style={styles.blogHero} />
        </View>
      ) : null}
      <Text style={[styles.substackTitle, { color: colors.primary }]} numberOfLines={3}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.blogSubtitle, { color: colors.secondary }]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
      <BlogByline
        authorName={authorName}
        meta={[dateLabel, hideReadTime ? "" : `${minutes} min read`].filter(Boolean).join(" · ")}
      />
      <View style={styles.blogFooterRow}>
        <View style={styles.blogStat}>
          <Heart size={14} color="#FF6719" fill="#FF6719" strokeWidth={0} />
          <Text style={[styles.blogStatText, { color: colors.muted }]}>
            {!hideCounts && likes != null ? formatCompact(likes) : "Like"}
          </Text>
        </View>
        {!hideCounts && comments != null ? (
          <View style={styles.blogStat}>
            <MessageCircle size={13} color={colors.muted} strokeWidth={2} />
            <Text style={[styles.blogStatText, { color: colors.muted }]}>{formatCompact(comments)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function WordPressCard({
  title,
  site,
  authorName,
  excerpt,
  image,
  dateLabel,
  minutes,
  tags,
  hideReadTime,
}: {
  title: string;
  site: string;
  authorName: string;
  excerpt: string;
  image: string | null;
  dateLabel: string;
  minutes: number;
  tags: string[] | null;
  hideReadTime?: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      <View style={styles.blogBrandRow}>
        <View style={[styles.blogBrandMark, { backgroundColor: "#21759B", borderRadius: 13 }]}>
          <Text style={styles.blogBrandMarkText}>W</Text>
        </View>
        <Text style={[styles.blogBrand, { color: colors.muted }]} numberOfLines={1}>
          {site}
        </Text>
      </View>
      {image ? (
        <View style={styles.blogHeroWrap}>
          <CardMedia uri={image} style={styles.blogHero} />
        </View>
      ) : null}
      <Text style={[styles.blogTitle, { color: colors.primary }]} numberOfLines={3}>
        {title}
      </Text>
      {excerpt ? (
        <Text style={[styles.blogSubtitle, { color: colors.secondary }]} numberOfLines={2}>
          {excerpt}
        </Text>
      ) : null}
      <BlogByline
        authorName={authorName}
        meta={[dateLabel, hideReadTime ? "" : `${minutes} min read`].filter(Boolean).join(" · ")}
      />
      <BlogTagRow tags={tags} />
    </View>
  );
}

function HashnodeCard({
  title,
  publication,
  authorName,
  excerpt,
  image,
  dateLabel,
  likes,
  comments,
  minutes,
  tags,
  hideCounts,
  hideReadTime,
}: {
  title: string;
  publication: string;
  authorName: string;
  excerpt: string;
  image: string | null;
  dateLabel: string;
  likes: number | null;
  comments: number | null;
  minutes: number;
  tags: string[] | null;
  hideCounts: boolean;
  hideReadTime?: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.blog, { backgroundColor: colors.surface }]}>
      <View style={styles.blogBrandRow}>
        <View style={[styles.blogBrandMark, { backgroundColor: "#2962FF" }]}>
          <Text style={styles.blogBrandMarkText}>H</Text>
        </View>
        <Text style={[styles.blogAuthor, { color: colors.primary }]} numberOfLines={1}>
          {publication}
        </Text>
        <Text style={[styles.blogMeta, { color: colors.muted }]}>· Hashnode</Text>
      </View>
      {image ? (
        <View style={styles.blogHeroWrap}>
          <CardMedia uri={image} style={styles.blogHero} />
        </View>
      ) : null}
      <Text style={[styles.blogTitle, { color: colors.primary }]} numberOfLines={3}>
        {title}
      </Text>
      {excerpt ? (
        <Text style={[styles.blogSubtitle, { color: colors.secondary }]} numberOfLines={2}>
          {excerpt}
        </Text>
      ) : null}
      <BlogByline
        authorName={authorName}
        meta={[dateLabel, hideReadTime ? "" : `${minutes} min read`].filter(Boolean).join(" · ")}
      />
      <View style={styles.blogFooterRow}>
        <View style={styles.blogStat}>
          <ThumbsUp size={13} color="#2962FF" strokeWidth={2} />
          <Text style={[styles.blogStatText, { color: colors.muted }]}>
            {!hideCounts && likes != null ? formatCompact(likes) : "React"}
          </Text>
        </View>
        {!hideCounts && comments != null ? (
          <View style={styles.blogStat}>
            <MessageCircle size={13} color={colors.muted} strokeWidth={2} />
            <Text style={[styles.blogStatText, { color: colors.muted }]}>{formatCompact(comments)}</Text>
          </View>
        ) : null}
      </View>
      <BlogTagRow tags={tags} />
    </View>
  );
}

/* ---------------- Template D: YouTube video/shorts/live/premiere ---------------- */
function YouTubeCard({
  kind,
  isStory,
  title,
  channel,
  thumb,
  channelAvatar,
  durationSec,
  views,
  age,
  scheduledLabel,
  watchingLabel,
  concurrentViewers,
  hideCounts,
  colorScheme,
}: {
  kind: YouTubeKind;
  isStory: boolean;
  title: string;
  channel: string;
  thumb: string | null;
  channelAvatar: string | null;
  durationSec: number | null;
  views: number | null;
  age: string | null;
  scheduledLabel: string | null;
  watchingLabel: string | null;
  concurrentViewers: number | null;
  hideCounts: boolean;
  colorScheme: CardColorScheme;
}) {
  const isDark = colorScheme === "dark";
  const showWatching = !hideCounts;
  const showViews = !hideCounts;
  const sub =
    kind === "live"
      ? (showWatching
        ? (watchingLabel ||
          (concurrentViewers != null
            ? `${formatCompact(concurrentViewers)} watching`
            : "Live now"))
        : null) || null
      : kind === "premiere"
        ? (scheduledLabel ? `Premieres ${scheduledLabel}` : "Premiere")
        : [
            showViews && views != null ? `${formatCompact(views)} views` : null,
            age,
            kind === "short" ? "Short" : null,
          ]
            .filter(Boolean)
            .join(" • ") || null;

  return (
    <View style={[styles.yt, { backgroundColor: isDark ? "#0F0F0F" : "#FFFFFF" }]}>
      <View style={styles.ytProviderRow}>
        <View style={styles.ytDot} />
        <Text style={[styles.ytProvider, { color: isDark ? "#AAAAAA" : "#606060" }]} numberOfLines={1}>
          YouTube
        </Text>
        {kind === "live" ? (
          <View style={[styles.ytKindChip, styles.ytKindLive]}>
            <Text style={styles.ytKindText}>LIVE</Text>
          </View>
        ) : kind === "premiere" ? (
          <View style={[styles.ytKindChip, styles.ytKindPremiere]}>
            <Text style={styles.ytKindText}>PREMIERE</Text>
          </View>
        ) : kind === "short" ? (
          <View style={[styles.ytKindChip, styles.ytKindShort]}>
            <Play size={9} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            <Text style={styles.ytKindText}>Shorts</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.ytTitle, { color: isDark ? "#FFFFFF" : "#0F0F0F" }]} numberOfLines={isStory ? 3 : 2}>
        {title}
      </Text>
      {sub ? (
        <Text style={[styles.ytSub, { color: isDark ? "#AAAAAA" : "#606060" }]} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
      {thumb ? (
        <View style={styles.ytThumbWrap}>
          <CardMedia uri={thumb} style={styles.ytThumb} />
          {kind === "video" && durationSec != null ? (
            <View style={styles.ytDuration}>
              <Text style={styles.ytDurationText}>{formatDuration(durationSec)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.ytFooter}>
        {channelAvatar ? (
          <Image source={{ uri: channelAvatar }} style={styles.ytChannelAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.ytChannelAvatar, styles.ytChannelFallback, { backgroundColor: isDark ? "#272727" : "#E5E5E5" }]}>
            <Text style={[styles.ytChannelInitial, { color: isDark ? "#FFFFFF" : "#0F0F0F" }]}>{getInitials(channel)}</Text>
          </View>
        )}
        <Text style={[styles.ytChannel, { color: isDark ? "#D8D8D8" : "#0F0F0F" }]} numberOfLines={1}>
          {channel}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Template C: X/Twitter post card ---------------- */

function XLogo({ size = 20 }: { size?: number }) {
  const barH = Math.max(2, size * 0.11);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: barH,
          borderRadius: barH / 2,
          backgroundColor: "#0F1419",
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size,
          height: barH,
          borderRadius: barH / 2,
          backgroundColor: "#0F1419",
          transform: [{ rotate: "-45deg" }],
        }}
      />
    </View>
  );
}

function VerifiedDot({ size = 17 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#1D9BF0",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={size * 0.62} color="#FFFFFF" strokeWidth={3.5} />
    </View>
  );
}

function TweetCard({
  body,
  authorName,
  handle,
  verified,
  timeLabel,
  views,
  likeCount,
  replyCount,
  avatar,
  hideCounts,
}: {
  body: string;
  authorName: string;
  handle: string | null;
  verified: boolean;
  timeLabel: string;
  views: number | null;
  likeCount: number | null;
  replyCount: number | null;
  avatar: string | null;
  hideCounts: boolean;
}) {
  const colors = useCardColors();
  return (
    <View style={[styles.tw, { backgroundColor: colors.surface }]}>
      <View style={styles.twHeader}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.twAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.twAvatar, styles.twAvatarFallback]}>
            <Text style={styles.twAvatarText}>{getInitials(authorName)}</Text>
          </View>
        )}
        <View style={styles.twNames}>
          <View style={styles.twNameRow}>
          <Text style={[styles.twName, { color: colors.primary }]} numberOfLines={1}>
              {authorName}
            </Text>
            {verified ? <VerifiedDot size={15} /> : null}
          </View>
          <Text style={[styles.twHandle, { color: colors.muted }]} numberOfLines={1}>
            {handle ? `@${handle} · ` : ""}{timeLabel}
          </Text>
        </View>
        <XLogo size={18} />
      </View>
      <Text style={[styles.twBody, { color: colors.primary }]} numberOfLines={6}>
        {body}
      </Text>
      {!hideCounts ? (
        <View style={[styles.twFooter, { borderTopColor: colors.divider }]}>
          {views != null ? (
            <View style={styles.twStat}>
              <Eye size={14} color="#536471" strokeWidth={2} />
              <Text style={[styles.twStatText, { color: colors.muted }]}>{formatCount(views)}</Text>
            </View>
          ) : null}
          <View style={styles.twStat}>
            <Heart
              size={14}
              color={likeCount ? "#F91880" : "#536471"}
              fill={likeCount ? "#F91880" : "transparent"}
              strokeWidth={2}
            />
            {likeCount != null ? (
              <Text style={[styles.twStatText, { color: colors.muted }]}>{formatCount(likeCount)}</Text>
            ) : null}
          </View>
          <View style={styles.twStat}>
            <MessageCircle size={14} color="#536471" strokeWidth={2} />
            <Text style={[styles.twStatText, { color: colors.muted }]}>
              {replyCount != null && replyCount > 0 ? formatCount(replyCount) : "Reply"}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#0B0B12",
  },

  /* blurred scene backdrop */
  sceneBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  sceneBackdropFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sceneBackdropBlur: {
    transform: [{ scale: SCENE_SCALE }],
  },
  sceneBackdropVeil: {
    backgroundColor: SCENE_VEIL,
  },
  cardMediaFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cardMediaVeil: {
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  /* scene container + floating card shell */
  scene: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  shell: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 28,
    backgroundColor: "transparent",
  },
  shellSurface: {
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  /* tweet embed */
  tw: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  twHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  twAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E7E9EA",
  },
  twAvatarFallback: {
    backgroundColor: "#0F1419",
    alignItems: "center",
    justifyContent: "center",
  },
  twAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  twNames: {
    flex: 1,
  },
  twNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  twName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F1419",
    flexShrink: 1,
  },
  twHandle: {
    fontSize: 13,
    color: "#536471",
    marginTop: 1,
  },
  twBody: {
    fontSize: 16,
    lineHeight: 23,
    color: "#0F1419",
    marginTop: 10,
  },
  twFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFF3F4",
  },
  twStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  twStatText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#536471",
  },

  /* youtube embed */
  yt: {
    backgroundColor: "#0F0F0F",
    padding: 16,
  },
  ytProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  ytDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF0000",
  },
  ytProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#AAAAAA",
    flexShrink: 1,
  },
  ytKindChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ytKindLive: {
    backgroundColor: "#FF0000",
  },
  ytKindPremiere: {
    backgroundColor: "rgba(15,15,15,0.85)",
    borderWidth: 1,
    borderColor: "#FF0000",
  },
  ytKindShort: {
    backgroundColor: "#FF0000",
  },
  ytKindText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  ytTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.1,
  },
  ytSub: {
    fontSize: 12,
    color: "#717171",
    marginTop: 4,
    fontWeight: "500",
  },
  ytThumbWrap: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#212121",
  },
  ytThumb: {
    width: "100%",
    height: "100%",
  },
  ytDuration: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ytDurationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ytFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  ytChannelAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#272727",
  },
  ytChannelFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  ytChannelInitial: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },
  ytChannel: {
    flex: 1,
    fontSize: 13,
    color: "#D8D8D8",
    fontWeight: "600",
  },

  /* tiktok embed */
  clip: {
    backgroundColor: "#000000",
    padding: 16,
  },
  clipProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  clipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FE2C55",
  },
  clipProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#9E9E9E",
  },
  clipAuthor: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "right",
  },
  clipCaption: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  clipPosterWrap: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#161616",
  },
  clipPoster: {
    width: "100%",
    height: "100%",
  },
  clipFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
  },
  clipStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  clipStatText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#CCCCCC",
  },

  /* reddit embed */
  post: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  postSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  postSubDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF4500",
    alignItems: "center",
    justifyContent: "center",
  },
  postSubDotText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  postSub: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1B",
    flexShrink: 1,
  },
  postAge: {
    fontSize: 12,
    color: "#7C7C7C",
    flexShrink: 1,
  },
  postTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#1A1A1B",
  },
  postSelf: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4A4A4A",
    marginTop: 6,
  },
  postThumbWrap: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#F6F7F8",
  },
  postThumb: {
    width: "100%",
    height: "100%",
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  postPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F6F7F8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  postPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1A1B",
  },
  postAuthor: {
    fontSize: 12,
    color: "#7C7C7C",
    flex: 1,
    textAlign: "right",
  },

  /* spotify embed */
  music: {
    backgroundColor: "#121212",
    padding: 16,
  },
  musicProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  musicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1DB954",
  },
  musicProvider: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#B3B3B3",
  },
  musicKind: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#1DB954",
  },
  musicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  musicCover: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
  },
  musicCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  musicCol: {
    flex: 1,
  },
  musicTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  musicArtist: {
    fontSize: 13,
    color: "#B3B3B3",
    marginTop: 3,
    fontWeight: "500",
  },
  musicFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  musicLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  musicFooterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#717171",
  },

  /* github embed */
  repo: {
    backgroundColor: "#0D1117",
    padding: 16,
  },
  repoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  repoAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#21262D",
  },
  repoAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  repoAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  repoNames: {
    flex: 1,
  },
  repoOwner: {
    fontSize: 12,
    color: "#8B949E",
    fontWeight: "500",
  },
  repoName: {
    fontSize: 16,
    color: "#58A6FF",
    fontWeight: "800",
  },
  repoPublic: {
    borderWidth: 1,
    borderColor: "#30363D",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  repoPublicText: {
    fontSize: 11,
    color: "#8B949E",
    fontWeight: "600",
  },
  repoDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: "#C9D1D9",
    marginTop: 10,
  },
  repoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#21262D",
  },
  repoStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  repoStatText: {
    fontSize: 12,
    color: "#C9D1D9",
    fontWeight: "600",
  },
  repoLangDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
  repoUpdated: {
    fontSize: 11,
    color: "#6E7681",
    flex: 1,
    textAlign: "right",
  },

  /* commerce embed */
  com: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  comStore: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  comStoreText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  comCondition: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 8,
  },
  comConditionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  comImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 4 / 3,
    backgroundColor: "#F5F5F5",
  },
  comImage: {
    width: "100%",
    height: "100%",
  },
  comTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: "#111111",
    marginTop: 8,
  },
  comPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
  },
  comPrice: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111111",
    flexShrink: 1,
  },
  comMrp: {
    fontSize: 13,
    color: "#888888",
    textDecorationLine: "line-through",
    flexShrink: 1,
  },
  comOff: {
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comOffText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E8E3E",
  },
  comRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  comRatingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  comRatingPillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  comStars: {
    flexDirection: "row",
    gap: 1,
  },
  comRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },
  comSeller: {
    fontSize: 12,
    color: "#888888",
    marginTop: 0,
    flexShrink: 1,
  },
  comSellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
  },
  comSold: {
    fontSize: 12,
    color: "#888888",
    flexShrink: 0,
  },

  /* twitch embed */
  st: {
    backgroundColor: "#0E0A13",
    padding: 16,
  },
  stProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  stDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9146FF",
  },
  stProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#ADADB8",
    flexShrink: 1,
  },
  stKindChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  stKindLive: {
    backgroundColor: "#EB0400",
  },
  stKindOff: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "#5C5C5C",
  },
  stKindClip: {
    backgroundColor: "#9146FF",
  },
  stKindText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  stStreamerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A1D47",
  },
  stAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  stAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  stStreamerCol: {
    flex: 1,
  },
  stStreamer: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stGame: {
    fontSize: 12,
    color: "#BF94FF",
    fontWeight: "600",
    marginTop: 1,
  },
  stTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 10,
    letterSpacing: -0.1,
  },
  stSub: {
    fontSize: 12,
    color: "#ADADB8",
    fontWeight: "500",
    marginTop: 4,
  },
  stThumbWrap: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#1F1430",
  },
  stThumb: {
    width: "100%",
    height: "100%",
  },
  stDuration: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  stDurationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  /* linkedin embed */
  li: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  liHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  liAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A66C2",
  },
  liAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  liAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  liNames: {
    flex: 1,
  },
  liName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111111",
  },
  liMeta: {
    fontSize: 12,
    color: "#666666",
    marginTop: 1,
  },
  liBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#0A66C2",
    alignItems: "center",
    justifyContent: "center",
  },
  liBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  liBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#111111",
    marginTop: 10,
  },
  liFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFF3F4",
  },
  liStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liStatText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666666",
  },

  /* indeed embed */
  in: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  inProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  inDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2557A7",
  },
  inProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#333333",
    flexShrink: 1,
  },
  inPosted: {
    flex: 1,
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
  },
  inImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 6,
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
  },
  inImage: {
    width: "100%",
    height: "100%",
  },
  inTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: -0.1,
  },
  inCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  inCompany: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#444444",
  },
  inMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  inMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inMetaText: {
    fontSize: 12,
    color: "#555555",
    flexShrink: 1,
  },
  inJobType: {
    backgroundColor: "#EDF2FA",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  inJobTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2557A7",
  },
  inSalaryRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFF1F3",
  },
  inSalary: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2557A7",
  },

  /* restaurant embed */
  re: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  reProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  reDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#333333",
    flexShrink: 1,
  },
  reRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  reRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111111",
  },
  reRatingCount: {
    fontSize: 11,
    color: "#666666",
  },
  reImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 8,
    backgroundColor: "#F5F5F5",
  },
  reImage: {
    width: "100%",
    height: "100%",
  },
  reTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: "#111111",
    marginTop: 10,
  },
  reCuisine: {
    fontSize: 13,
    color: "#555555",
    marginTop: 3,
    fontWeight: "500",
  },
  reMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  reMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reMetaText: {
    fontSize: 12,
    color: "#444444",
    flexShrink: 1,
  },
  rePrice: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 10,
  },

  /* pinterest embed */
  pi: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  piProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  piDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E60023",
  },
  piProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#B73B3B",
  },
  piImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 4 / 3,
    backgroundColor: "#F5F5F5",
  },
  piImage: {
    width: "100%",
    height: "100%",
  },
  piTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#111111",
    marginTop: 10,
  },
  piDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: "#555555",
    marginTop: 5,
  },
  piFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  piAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E60023",
    alignItems: "center",
    justifyContent: "center",
  },
  piAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },
  piAuthor: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#444444",
  },

  /* app embed */
  ap: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  apProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  apDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  apProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#333333",
  },
  apRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  apIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#F0F0F5",
  },
  apIconFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A60FE",
  },
  apIconText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 24,
  },
  apCol: {
    flex: 1,
  },
  apTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: "#111111",
  },
  apDeveloper: {
    fontSize: 13,
    color: "#555555",
    marginTop: 2,
    fontWeight: "500",
  },
  apDownloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  apDownloadText: {
    fontSize: 11,
    color: "#777777",
    flexShrink: 1,
  },
  apCategoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F5",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginTop: 10,
  },
  apCategoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333333",
  },
  apDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: "#444444",
    marginTop: 8,
  },
  apFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  apPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    flexShrink: 1,
  },
  apRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  apRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#444444",
  },

  /* airbnb embed */
  sy: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  syProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  syDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF385C",
  },
  syProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#333333",
    flexShrink: 1,
  },
  syRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  syRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#444444",
  },
  syImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#F5F5F5",
  },
  syImage: {
    width: "100%",
    height: "100%",
  },
  syTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#222222",
    marginTop: 10,
  },
  syMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  syMetaText: {
    fontSize: 12,
    color: "#555555",
    flexShrink: 1,
  },
  syHost: {
    fontSize: 12,
    color: "#717171",
    marginTop: 5,
    fontWeight: "500",
  },
  syPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222222",
    marginTop: 10,
  },

  /* steam embed */
  gm: {
    backgroundColor: "#1B2838",
    padding: 16,
  },
  gmProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  gmDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#66C0F4",
  },
  gmProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#7EA6BD",
    flexShrink: 1,
  },
  gmMetaChip: {
    backgroundColor: "#40705A",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  gmMetaText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  gmImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#2A475E",
  },
  gmImage: {
    width: "100%",
    height: "100%",
  },
  gmTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 10,
    letterSpacing: -0.1,
  },
  gmDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: "#B8C7D1",
    marginTop: 5,
  },
  gmMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  gmGenre: {
    fontSize: 11,
    color: "#66C0F4",
    fontWeight: "600",
    flexShrink: 1,
  },
  gmRelease: {
    fontSize: 11,
    color: "#8F9BA3",
  },
  gmPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#BEEE11",
    marginTop: 10,
  },

  /* book embed */
  bk: {
    backgroundColor: "#F4F1EA",
    padding: 16,
  },
  bkProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  bkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B45309",
  },
  bkProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#8A6D3B",
  },
  bkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bkCover: {
    width: 76,
    height: 116,
    borderRadius: 4,
    backgroundColor: "#E4DDCE",
  },
  bkCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  bkCol: {
    flex: 1,
  },
  bkTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#2A2416",
  },
  bkAuthor: {
    fontSize: 13,
    color: "#7A6A4A",
    marginTop: 5,
    fontWeight: "600",
  },
  bkMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0D7C3",
  },
  bkRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bkRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3A3220",
  },
  bkPages: {
    fontSize: 12,
    color: "#6B6049",
  },

  /* product hunt embed */
  lc: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  lcProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  lcDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6154",
  },
  lcProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#DA552F",
  },
  lcTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lcTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: -0.2,
  },
  lcTagline: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555555",
    marginTop: 8,
  },
  lcFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  lcAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6154",
    alignItems: "center",
    justifyContent: "center",
  },
  lcAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  lcMaker: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#444444",
  },
  lcVotes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF6154",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lcVotesText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* ytmusic embed */
  yi: {
    backgroundColor: "#0F0F0F",
    padding: 16,
  },
  yiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  yiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF0033",
  },
  yiBrand: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#AAAAAA",
  },
  yiKind: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FF0033",
  },
  yiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  yiCover: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#1F1F1F",
  },
  yiCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  yiCol: {
    flex: 1,
  },
  yiTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  yiArtist: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 3,
    fontWeight: "500",
  },

  /* jiosaavn embed */
  js: {
    backgroundColor: "#111012",
    padding: 16,
  },
  jsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  jsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D00",
  },
  jsBrand: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: "#E7E5E4",
  },
  jsKind: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FF4D00",
  },
  jsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  jsCover: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: "#241E1C",
  },
  jsCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  jsCol: {
    flex: 1,
  },
  jsTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  jsArtist: {
    fontSize: 13,
    color: "#A8A29E",
    marginTop: 3,
    fontWeight: "600",
  },
  jsTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  jsTime: {
    fontSize: 11,
    color: "#8E8C90",
    fontWeight: "600",
  },
  jsBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "#2B2623",
    marginTop: 14,
    overflow: "hidden",
  },
  jsBarFill: {
    width: "42%",
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#FF4D00",
  },

  /* gaana embed */
  gn: {
    backgroundColor: "#0C1410",
    padding: 16,
  },
  gnHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  gnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22D37A",
  },
  gnBrand: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#B7C9C0",
  },
  gnKind: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#22D37A",
  },
  gnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gnCover: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#14241C",
  },
  gnCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  gnCol: {
    flex: 1,
  },
  gnTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  gnArtist: {
    fontSize: 13,
    color: "#93A79C",
    marginTop: 3,
    fontWeight: "500",
  },
  gnFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  gnFooterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D1E8DB",
  },

  /* applemusic embed */
  am: {
    backgroundColor: "#FAFAFA",
    padding: 16,
  },
  amHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  amBrand: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#9B9B9B",
  },
  amKind: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FA233B",
  },
  amArt: {
    width: "100%",
    aspectRatio: 1.7,
    borderRadius: 18,
    backgroundColor: "#EFEFEF",
    marginBottom: 12,
  },
  amArtFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  amTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: "#1D1D1F",
    letterSpacing: -0.3,
  },
  amArtist: {
    fontSize: 13,
    color: "#86868B",
    marginTop: 3,
    fontWeight: "500",
  },
  amFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },
  amFooterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF2D55",
  },
  amFooterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#86868B",
  },

  /* netflix embed */
  nf: {
    backgroundColor: "#000000",
    padding: 16,
  },
  nfWordmark: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 5,
    color: "#E50914",
    marginBottom: 10,
  },
  nfHero: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#161616",
    marginBottom: 10,
  },
  nfHeroFill: {
    width: "100%",
    height: "100%",
  },
  nfHeroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  nfTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  nfTagline: {
    fontSize: 13,
    color: "#A3A3A3",
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "500",
  },
  nfMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  nfMeta: {
    flex: 1,
    fontSize: 12,
    color: "#737373",
    fontWeight: "600",
  },
  nfMatch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E50914",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nfMatchText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  /* primevideo embed */
  pv: {
    backgroundColor: "#0B1425",
    padding: 16,
  },
  pvThumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#12203F",
    marginBottom: 10,
  },
  pvThumb: {
    width: "100%",
    height: "100%",
  },
  pvThumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  pvPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderRadius: 20,
    backgroundColor: "rgba(0, 168, 225, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  pvUhd: {
    position: "absolute",
    right: 8,
    bottom: 8,
    fontSize: 9,
    fontWeight: "800",
    color: "#7DE2FF",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
    letterSpacing: 0.6,
  },
  pvTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  pvTagline: {
    fontSize: 13,
    color: "#9FB0C9",
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "500",
  },
  pvMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  pvMeta: {
    flex: 1,
    fontSize: 12,
    color: "#89A0BD",
    fontWeight: "600",
  },
  pvRating: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00A8E1",
  },
  pvWordmark: {
    textAlign: "right",
    fontSize: 13,
    fontWeight: "900",
    color: "#00A8E1",
    marginTop: 10,
    letterSpacing: 0.4,
    textTransform: "lowercase",
  },

  /* hotstar embed */
  hs: {
    backgroundColor: "#0F0E2A",
    padding: 16,
  },
  hsBannerWrap: {
    width: "100%",
    aspectRatio: 2.1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1C1B45",
    marginBottom: 12,
  },
  hsBanner: {
    width: "100%",
    height: "100%",
  },
  hsBannerFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  hsAgeChip: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hsAgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  hsTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  hsTagline: {
    fontSize: 13,
    color: "#B9B9CF",
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "500",
  },
  hsFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#262554",
  },
  hsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2FC9E0",
  },
  hsBrand: {
    fontSize: 12,
    fontWeight: "800",
    color: "#E6E6F2",
  },
  hsMeta: {
    flex: 1,
    fontSize: 12,
    color: "#8E8EAA",
    fontWeight: "600",
    textAlign: "right",
  },

  /* kukufm embed */
  kf: {
    backgroundColor: "#1A1613",
    padding: 16,
  },
  kfHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  kfDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF8A2B",
  },
  kfBrand: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#C9BFB2",
  },
  kfEpisode: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#FF8A2B",
  },
  kfTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  kfHost: {
    fontSize: 13,
    color: "#B0A79E",
    marginTop: 3,
    fontWeight: "600",
  },
  kfShow: {
    fontSize: 13,
    color: "#8F877F",
    lineHeight: 18,
    marginTop: 8,
    fontWeight: "500",
  },
  kfWaveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A241F",
  },
  kfDuration: {
    flex: 1,
    fontSize: 12,
    color: "#B0A79E",
    fontWeight: "700",
  },
  kfPlay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF8A2B",
    alignItems: "center",
    justifyContent: "center",
  },

  /* applepodcasts embed */
  pod: {
    backgroundColor: "#14141B",
    padding: 16,
  },
  podHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  podDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8B3DFF",
  },
  podBrand: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#8E8E9E",
  },
  podRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  podCover: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1F1F2E",
  },
  podCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  podCol: {
    flex: 1,
  },
  podEpisode: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#8B3DFF",
    marginBottom: 2,
  },
  podTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  podShow: {
    fontSize: 13,
    color: "#8E8E9E",
    marginTop: 3,
    fontWeight: "500",
  },
  podFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  podDuration: {
    flex: 1,
    fontSize: 12,
    color: "#8E8E9E",
    fontWeight: "700",
  },
  podPlay: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#8B3DFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* pocketfm embed */
  pf: {
    backgroundColor: "#08110E",
    padding: 16,
  },
  pfBanner: {
    width: "100%",
    aspectRatio: 2.2,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0E1E19",
  },
  pfBannerFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  pfChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 196, 140, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(0, 196, 140, 0.5)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  pfChipText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#4DD6A8",
  },
  pfTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginTop: 8,
  },
  pfMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  pfHost: {
    fontSize: 13,
    color: "#9FB9AF",
    fontWeight: "600",
    flexShrink: 1,
  },
  pfShow: {
    flex: 1,
    fontSize: 12,
    color: "#5E7A70",
    fontWeight: "500",
    textAlign: "right",
  },
  pfWaveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#132B24",
  },
  pfDuration: {
    flex: 1,
    fontSize: 12,
    color: "#9FB9AF",
    fontWeight: "700",
  },
  pfPlay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00C48C",
    alignItems: "center",
    justifyContent: "center",
  },
  pfBrand: {
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800",
    color: "#4DD6A8",
    marginTop: 8,
    letterSpacing: 0.6,
  },

  /* kindle embed */
  kd: {
    backgroundColor: "#F2EFE9",
    padding: 16,
  },
  kdProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  kdDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9900",
  },
  kdProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#8B7E6B",
  },
  kdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  kdCover: {
    width: 64,
    height: 92,
    borderRadius: 6,
    backgroundColor: "#E5DFD3",
  },
  kdCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  kdCol: {
    flex: 1,
  },
  kdTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#1F1F1F",
    letterSpacing: -0.2,
  },
  kdAuthor: {
    fontSize: 13,
    color: "#6E6455",
    marginTop: 3,
    fontWeight: "600",
  },
  kdPages: {
    fontSize: 12,
    color: "#8E8371",
    marginTop: 4,
    fontWeight: "500",
  },
  kdMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2DBCE",
  },
  kdRatingText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#6E6455",
  },
  kdKindle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.4,
  },

  /* wattpad embed */
  wt: {
    backgroundColor: "#FFFFFC",
    padding: 16,
  },
  wtProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  wtDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00B96B",
  },
  wtProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#8A8A86",
  },
  wtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  wtCover: {
    width: 64,
    height: 92,
    borderRadius: 10,
    backgroundColor: "#EFF7F2",
  },
  wtCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  wtCol: {
    flex: 1,
  },
  wtTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#1E1E1E",
    letterSpacing: -0.2,
  },
  wtAuthor: {
    fontSize: 13,
    color: "#71716D",
    marginTop: 3,
    fontWeight: "600",
  },
  wtRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  wtRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5D8A74",
  },

  /* pratilipi embed */
  pr: {
    backgroundColor: "#FFF7ED",
    padding: 16,
  },
  prProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  prDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B2C",
  },
  prProvider: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#B3805F",
  },
  prTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: "#2E1F16",
    letterSpacing: -0.3,
  },
  prAuthor: {
    fontSize: 13,
    color: "#8A6A52",
    marginTop: 3,
    fontWeight: "700",
  },
  prExcerpt: {
    fontSize: 13,
    color: "#7C6C5F",
    lineHeight: 19,
    marginTop: 8,
    fontWeight: "500",
  },
  prBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1DFCE",
  },
  prCover: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#F5E2CE",
  },
  prCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  /* webtoon embed */
  wb: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  wbWordmark: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#00DC64",
    marginBottom: 10,
  },
  wbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  wbCover: {
    width: 64,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#EFFAF3",
  },
  wbCoverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  wbCol: {
    flex: 1,
  },
  wbTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#18181B",
    letterSpacing: -0.2,
  },
  wbAuthor: {
    fontSize: 13,
    color: "#6B6B70",
    marginTop: 3,
    fontWeight: "600",
  },
  wbLikesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  wbLikesText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3F7A5B",
  },

  /* medium embed */
  md: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  mdProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  mdDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#000000",
  },
  mdProvider: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: "#292929",
  },
  mdHeroWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#F5F5F5",
  },
  mdHero: {
    width: "100%",
    aspectRatio: 1.6,
  },
  mdTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#0B0B0B",
    letterSpacing: -0.3,
  },
  mdAuthor: {
    fontSize: 14,
    color: "#292929",
    marginTop: 8,
    fontWeight: "700",
  },
  mdExcerpt: {
    fontSize: 14,
    color: "#6B6B6B",
    lineHeight: 20,
    marginTop: 8,
    fontWeight: "400",
  },
  mdFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  mdFooterText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "400",
    color: "#8A8A8A",
  },

  /* linksnap / default article embed */
  dyn: {
    padding: 20,
  },
  dynHeroWrap: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  dynHero: {
    width: "100%",
    height: "100%",
  },
  dynTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  dynTitleBelowHero: {
    marginTop: 10,
  },
  dynExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: "400",
  },
  dynExcerptBelowHero: {
    marginTop: 10,
    flex: 0,
  },
  dynThumbWrap: {
    alignItems: "flex-start",
  },
  dynThumb: {
    width: 104,
    height: 104,
    borderRadius: 12,
  },
  dynFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  dynAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  dynAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444444",
  },
  dynAuthor: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  dynReadTime: {
    fontSize: 12,
    fontWeight: "400",
  },

  /* blog / long-form article cards */
  blog: {
    padding: 18,
  },
  blogBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  blogBrandMark: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  blogBrandMarkText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  blogBrand: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  blogHeroWrap: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F4F4F5",
  },
  blogHero: {
    width: "100%",
    height: 150,
  },
  blogTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginTop: 12,
  },
  blogTitleSerif: {
    fontFamily: "serif",
    fontWeight: "700",
  },
  substackTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "serif",
    fontWeight: "700",
    marginTop: 12,
  },
  substackWordmark: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FF6719",
    letterSpacing: -0.2,
  },
  blogSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  blogByline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  blogAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
  },
  blogAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  blogAvatarText: {
    fontSize: 11,
    fontWeight: "800",
  },
  blogAuthor: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  blogMeta: {
    fontSize: 12,
    flexShrink: 0,
  },
  blogTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  blogTag: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  blogTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  blogFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  blogStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  blogStatText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* X article */
  xaHeroWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F4F4F5",
  },
  xaHero: {
    width: "100%",
    height: 170,
  },
  xaBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xaBadgeStandalone: {
    alignSelf: "flex-start",
    backgroundColor: "#0F1419",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xaBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  xaHeadline: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    marginTop: 12,
  },

  /* LinkedIn article */
  liMark: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: "#0A66C2",
    alignItems: "center",
    justifyContent: "center",
  },
  liMarkText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  laKicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#0A66C2",
    textTransform: "uppercase",
    marginTop: 14,
  },
});

export default LinkCardView;
