import { forwardRef, useState, type ReactNode } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from "react-native";
import {
  ArrowBigUp,
  BookOpen,
  Building2,
  Check,
  Clock,
  Download,
  GitFork,
  Heart,
  MapPin,
  MessageCircle,
  Music,
  Play,
  Repeat2,
  Star,
  ThumbsUp,
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

export type CardTheme = "editorial" | "spotlight" | "tweet" | "youtube" | "clip" | "post" | "music" | "repo" | "commerce" | "stream" | "linkedin" | "indeed" | "zomato" | "swiggy" | "pinterest" | "app" | "stay" | "game" | "book" | "launch";
export type AspectRatio = "story" | "square";
export type CardBackgroundMode = "image" | "color";

export type LinkCardViewProps = ViewProps & {
  preview?: LinkPreview | null;
  loading?: boolean;
  error?: string | null;
  theme?: CardTheme;
  aspectRatio?: AspectRatio;
  safeMode?: boolean;
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
  /** Manual overrides from the studio controls (take precedence over parsed meta). */
  author?: string;
  readMinutes?: string;
  dateText?: string;
  location?: string;
  /** Site favicon (from parsed metadata) shown next to the publisher label. */
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
  editorial: { surface: "#FFFFFF", radius: 24, border: "rgba(0, 0, 0, 0.08)" },
  spotlight: { surface: "#0D1A3F", radius: 24, border: "rgba(255, 255, 255, 0.18)" },
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
function CardShell({ theme, children }: { theme: CardTheme; children: ReactNode }) {
  const meta = CARD_META[theme];
  return (
    <View
      style={[
        styles.shell,
        {
          width: `${CARD_W_RATIO * 100}%`,
          maxHeight: `${CARD_MAX_H_RATIO * 100}%`,
          borderRadius: meta.radius,
          backgroundColor: meta.surface,
        },
      ]}
    >
      <View
        style={[
          styles.shellSurface,
          { borderRadius: meta.radius, backgroundColor: meta.surface, borderColor: meta.border },
        ]}
      >
        {children}
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
    theme = "editorial",
    aspectRatio = "story",
    safeMode = false,
    bgMode = "image",
    bgColor = "#0B0B12",
    backgroundImage,
    blurRadius = SCENE_BLUR,
    vignette = 0,
    author,
    readMinutes,
    dateText,
    location,
    handle,
    verified,
    favicon,
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
  const palette = getPalette(domainFromUrl(url));
  const authorName = cleanAuthor(author || preview?.author, publisher);
  const minutes = readMinutesOf(readMinutes, preview || null);
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
  const ytViews = resolveCount(views, preview?.viewCount);
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
          thumb={preview?.image || null}
          game={stGame}
          viewers={stViewers}
          durationSec={stDuration}
          age={timeAgo(preview?.publishedAt || null)}
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
          image={preview?.image || null}
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
          image={preview?.image || null}
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
          image={preview?.image || null}
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
          image={preview?.image || null}
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
          image={preview?.image || null}
        />
      );
    }
    if (theme === "game") {
      return (
        <GameCard
          title={title}
          description={excerpt}
          image={preview?.image || null}
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
          image={preview?.image || null}
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
    if (theme === "commerce") {
      return (
        <CommerceCard
          store={store}
          title={title}
          image={preview?.image || null}
          price={cPrice}
          mrp={cMrp}
          rating={cRating}
          reviews={cReviews}
          seller={cSeller}
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
          cover={preview?.image || null}
        />
      );
    }
    if (theme === "post") {
      return (
        <PostCard
          subreddit={rdSub}
          title={title}
          selftext={excerpt}
          image={preview?.image || null}
          authorName={authorName}
          score={rdScore}
          comments={rdComments}
          age={timeAgo(preview?.publishedAt || null)}
        />
      );
    }
    if (theme === "clip") {
      return (
        <ClipCard
          caption={title}
          authorName={authorName}
          handle={tweetHandle}
          poster={preview?.image || null}
          likes={likeCount}
          comments={replyCount}
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
          thumb={preview?.image || null}
          channelAvatar={avatar}
          durationSec={ytDuration}
          views={ytViews}
          age={timeAgo(preview?.publishedAt || null)}
          scheduledLabel={ytScheduled}
          watchingLabel={ytWatching}
          concurrentViewers={preview?.concurrentViewers ?? null}
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
          likeCount={likeCount}
          replyCount={replyCount}
          avatar={avatar}
        />
      );
    }
    if (theme === "spotlight") {
      return (
        <SpotlightCard
          isStory={isStory}
          title={title}
          excerpt={excerpt}
          authorName={authorName}
          minutes={minutes}
          dateLabel={dateLabel}
          pill={pill}
          image={preview?.image || null}
        />
      );
    }
    return (
      <DynamicCard
        isStory={isStory}
        cardWidth={width}
        title={title}
        excerpt={excerpt}
        authorName={authorName}
        minutes={minutes}
        image={preview?.image || null}
        favicon={favicon ?? preview?.favicon ?? null}
      />
    );
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
          <SceneBackdrop image={backgroundImage ?? preview?.image ?? null} palette={palette} mode={bgMode} solidColor={bgColor} blur={blurRadius} vignette={vignette} />
          <View style={[styles.scene, { paddingTop: safeTop, paddingBottom: safeBottom }]}>
            <CardShell theme={theme}>{renderTheme()}</CardShell>
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
  likes,
  comments,
}: {
  caption: string;
  authorName: string;
  handle: string | null;
  poster: string | null;
  likes: number | null;
  comments: number | null;
}) {
  return (
    <View style={styles.clip}>
      <View style={styles.clipProviderRow}>
        <View style={styles.clipDot} />
        <Text style={styles.clipProvider} numberOfLines={1}>
          TikTok
        </Text>
        <Text style={styles.clipAuthor} numberOfLines={1}>
          @{handle || authorName.replace(/^@/, "")}
        </Text>
      </View>
      <Text style={styles.clipCaption} numberOfLines={3}>
        {caption}
      </Text>
      {poster ? (
        <View style={styles.clipPosterWrap}>
          <Image source={{ uri: poster }} style={styles.clipPoster} resizeMode="cover" />
        </View>
      ) : null}
      <View style={styles.clipFooter}>
        <View style={styles.clipStat}>
          <Heart size={14} color="#FE2C55" fill="#FE2C55" strokeWidth={2} />
          {likes != null ? <Text style={styles.clipStatText}>{formatCompact(likes)}</Text> : null}
        </View>
        <View style={styles.clipStat}>
          <MessageCircle size={14} color="#9E9E9E" strokeWidth={2} />
          {comments != null ? <Text style={styles.clipStatText}>{formatCompact(comments)}</Text> : null}
        </View>
      </View>
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
  score,
  comments,
  age,
}: {
  subreddit: string | null;
  title: string;
  selftext: string;
  image: string | null;
  authorName: string;
  score: number | null;
  comments: number | null;
  age: string | null;
}) {
  const hasImage = !!image;
  const hasText = selftext.trim().length > 0;
  return (
    <View style={styles.post}>
      <View style={styles.postSubRow}>
        <View style={styles.postSubDot}>
          <Text style={styles.postSubDotText}>r/</Text>
        </View>
        <Text style={styles.postSub} numberOfLines={1}>
          r/{subreddit || "reddit"}
        </Text>
        {age ? (
          <Text style={styles.postAge} numberOfLines={1}>
            • {age}
          </Text>
        ) : null}
      </View>
      <Text style={styles.postTitle} numberOfLines={hasImage ? 2 : 3}>
        {title}
      </Text>
      {hasText ? (
        <Text style={styles.postSelf} numberOfLines={hasImage ? 2 : 4}>
          {selftext}
        </Text>
      ) : null}
      {image ? (
        <View style={styles.postThumbWrap}>
          <Image source={{ uri: image }} style={styles.postThumb} resizeMode="cover" />
        </View>
      ) : null}
      <View style={styles.postFooter}>
        {score != null ? (
          <View style={styles.postPill}>
            <ArrowBigUp size={14} color="#FF4500" strokeWidth={2.2} />
            <Text style={styles.postPillText}>{formatCompact(score)}</Text>
          </View>
        ) : null}
        {comments != null ? (
          <View style={styles.postPill}>
            <MessageCircle size={13} color="#7C7C7C" strokeWidth={2} />
            <Text style={styles.postPillText}>{formatCompact(comments)}</Text>
          </View>
        ) : null}
        <Text style={styles.postAuthor} numberOfLines={1}>
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
  return (
    <View style={styles.music}>
      <View style={styles.musicProviderRow}>
        <View style={styles.musicDot} />
        <Text style={styles.musicProvider} numberOfLines={1}>
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
          <Image source={{ uri: cover }} style={styles.musicCover} resizeMode="cover" />
        ) : (
          <View style={[styles.musicCover, styles.musicCoverFallback]}>
            <Music size={26} color="#1DB954" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.musicCol}>
          <Text style={styles.musicTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.musicArtist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>
      <View style={styles.musicFooter}>
        <View style={styles.musicLogo}>
          <Music size={10} color="#000000" strokeWidth={2.5} />
        </View>
        <Text style={styles.musicFooterText}>Spotify</Text>
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
  const [owner, repo] = fullName.includes("/") ? fullName.split("/", 2) : ["", fullName];
  return (
    <View style={styles.repo}>
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
            <Text style={styles.repoOwner} numberOfLines={1}>
              {owner} /
            </Text>
          ) : null}
          <Text style={styles.repoName} numberOfLines={1}>
            {repo}
          </Text>
        </View>
        <View style={styles.repoPublic}>
          <Text style={styles.repoPublicText}>Public</Text>
        </View>
      </View>
      {description ? (
        <Text style={styles.repoDesc} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      <View style={styles.repoFooter}>
        {language ? (
          <View style={styles.repoStat}>
            <View style={[styles.repoLangDot, { backgroundColor: LANG_COLORS[language] || "#8B949E" }]} />
            <Text style={styles.repoStatText}>{language}</Text>
          </View>
        ) : null}
        {stars != null ? (
          <View style={styles.repoStat}>
            <Star size={13} color="#E3B341" fill="#E3B341" strokeWidth={1.5} />
            <Text style={styles.repoStatText}>{formatCompact(stars)}</Text>
          </View>
        ) : null}
        {forks != null ? (
          <View style={styles.repoStat}>
            <GitFork size={13} color="#8B949E" strokeWidth={2} />
            <Text style={styles.repoStatText}>{formatCompact(forks)}</Text>
          </View>
        ) : null}
        {updated ? (
          <Text style={styles.repoUpdated} numberOfLines={1}>
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
}) {
  const live = kind === "live";
  const sub =
    live
      ? [
          viewers != null ? `${formatCompact(viewers)} watching` : "Live now",
          age,
        ]
          .filter(Boolean)
          .join(" • ")
      : kind === "channel"
        ? login
          ? `twitch.tv/${login}`
          : "Twitch channel"
        : [
            viewers != null ? `${formatCompact(viewers)} views` : null,
            age,
          ]
            .filter(Boolean)
            .join(" • ") || null;

  return (
    <View style={styles.st}>
      <View style={styles.stProviderRow}>
        <View style={styles.stDot} />
        <Text style={styles.stProvider} numberOfLines={1}>
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
          <Text style={styles.stStreamer} numberOfLines={1}>
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
        <Text style={styles.stTitle} numberOfLines={isStory ? 3 : 2}>
          {title}
        </Text>
      ) : null}
      {sub ? (
        <Text style={styles.stSub} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
      {thumb ? (
        <View style={styles.stThumbWrap}>
          <Image source={{ uri: thumb }} style={styles.stThumb} resizeMode="cover" />
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
}: {
  store: CommerceStore;
  title: string;
  image: string | null;
  price: string | null;
  mrp: string | null;
  rating: number | null;
  reviews: number | null;
  seller: string | null;
}) {
  const meta = STORE_DESIGN[store];
  const pNum = parsePriceNumber(price);
  const mNum = parsePriceNumber(mrp);
  const off = pNum != null && mNum != null && mNum > pNum ? Math.round((1 - pNum / mNum) * 100) : null;
  const fullStars = rating != null ? Math.round(rating) : 0;

  return (
    <View style={styles.com}>
      {image ? (
        <View style={styles.comImageWrap}>
          <Image source={{ uri: image }} style={styles.comImage} resizeMode="cover" />
        </View>
      ) : null}
      <View style={[styles.comStore, { backgroundColor: meta.color }]}>
        <Text style={[styles.comStoreText, meta.wordmarkStyle]}>{meta.label}</Text>
      </View>
      <Text style={styles.comTitle} numberOfLines={2}>
        {title}
      </Text>
      {price || mrp ? (
        <View style={styles.comPriceRow}>
          {price ? (
            <Text style={[styles.comPrice, { color: meta.priceColor }]} numberOfLines={1}>
              {price}
            </Text>
          ) : null}
          {mrp ? (
            <Text style={styles.comMrp} numberOfLines={1}>
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
              <Text style={[styles.comRatingText, { color: meta.ratingCountColor }]}>
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
            <Text style={[styles.comRatingText, { color: meta.ratingTextColor }]}>
              {rating.toFixed(1)}
              {reviews != null ? (
                <Text style={{ color: meta.ratingCountColor }}>
                  {` (${formatCompact(reviews)})`}
                </Text>
              ) : null}
            </Text>
          </View>
        )
      ) : null}
      {seller ? (
        <Text style={styles.comSeller} numberOfLines={1}>
          {meta.sellerPrefix} {seller}
        </Text>
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
}: {
  headline: string | null;
  description: string;
  authorName: string;
  timeLabel: string;
  reposts: number | null;
  likes: number | null;
  avatar: string | null;
}) {
  const body = headline && headline !== description ? `${headline}\n${description}`.trim() : headline || description;
  return (
    <View style={styles.li}>
      <View style={styles.liHeader}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.liAvatar} resizeMode="cover" />
        ) : (
          <View style={[styles.liAvatar, styles.liAvatarFallback]}>
            <Text style={styles.liAvatarText}>{getInitials(authorName)}</Text>
          </View>
        )}
        <View style={styles.liNames}>
          <Text style={styles.liName} numberOfLines={1}>
            {authorName}
          </Text>
          <Text style={styles.liMeta} numberOfLines={1}>
            {timeLabel}
          </Text>
        </View>
        <View style={styles.liBadge}>
          <Text style={styles.liBadgeText}>in</Text>
        </View>
      </View>
      <Text style={styles.liBody} numberOfLines={6}>
        {body}
      </Text>
      {reposts != null || likes != null ? (
        <View style={styles.liFooter}>
          {reposts != null ? (
            <View style={styles.liStat}>
              <Repeat2 size={13} color="#0A66C2" strokeWidth={2} />
              <Text style={styles.liStatText}>{formatCompact(reposts)}</Text>
            </View>
          ) : null}
          {likes != null ? (
            <View style={styles.liStat}>
              <ThumbsUp size={13} color="#0A66C2" strokeWidth={2} />
              <Text style={styles.liStatText}>{formatCompact(likes)}</Text>
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
  return (
    <View style={styles.in}>
      <View style={styles.inProviderRow}>
        <View style={styles.inDot} />
        <Text style={styles.inProvider}>Indeed</Text>
        {posted ? (
          <Text style={styles.inPosted} numberOfLines={1}>
            {posted}
          </Text>
        ) : null}
      </View>
      {image ? (
        <View style={styles.inImageWrap}>
          <Image source={{ uri: image }} style={styles.inImage} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={styles.inTitle} numberOfLines={2}>
        {title}
      </Text>
      {company ? (
        <View style={styles.inCompanyRow}>
          <Building2 size={13} color="#8A8A8A" strokeWidth={2} />
          <Text style={styles.inCompany} numberOfLines={1}>
            {company}
          </Text>
        </View>
      ) : null}
      {location || jobType ? (
        <View style={styles.inMetaRow}>
          {location ? (
            <View style={styles.inMetaItem}>
              <MapPin size={12} color="#2557A7" strokeWidth={2} />
              <Text style={styles.inMetaText} numberOfLines={1}>
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
        <View style={styles.inSalaryRow}>
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
  const meta = RESTAURANT_BRAND[brand];
  return (
    <View style={styles.re}>
      <View style={styles.reProviderRow}>
        <View style={[styles.reDot, { backgroundColor: meta.color }]} />
        <Text style={styles.reProvider}>{meta.label}</Text>
        {rating != null ? (
          <View style={styles.reRatingRow}>
            <Star size={11} color="#F59E0B" fill="#F59E0B" strokeWidth={1} />
            <Text style={styles.reRatingText}>{rating.toFixed(1)}</Text>
            {reviews != null ? (
              <Text style={styles.reRatingCount} numberOfLines={1}>
                ({formatCompact(reviews)})
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {image ? (
        <View style={styles.reImageWrap}>
          <Image source={{ uri: image }} style={styles.reImage} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={styles.reTitle} numberOfLines={1}>
        {title}
      </Text>
      {cuisine ? (
        <Text style={styles.reCuisine} numberOfLines={1}>
          {cuisine}
        </Text>
      ) : null}
      {location || eta ? (
        <View style={styles.reMetaRow}>
          {location ? (
            <View style={styles.reMetaItem}>
              <MapPin size={12} color={meta.color} strokeWidth={2} />
              <Text style={styles.reMetaText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
          {eta ? (
            <View style={styles.reMetaItem}>
              <Clock size={12} color={meta.color} strokeWidth={2} />
              <Text style={styles.reMetaText} numberOfLines={1}>
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
  return (
    <View style={styles.pi}>
      <View style={styles.piProviderRow}>
        <View style={styles.piDot} />
        <Text style={styles.piProvider}>Pinterest</Text>
      </View>
      {image ? (
        <View style={styles.piImageWrap}>
          <Image source={{ uri: image }} style={styles.piImage} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={styles.piTitle} numberOfLines={2}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.piDesc} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      <View style={styles.piFooter}>
        <View style={styles.piAvatar}>
          <Text style={styles.piAvatarText}>{getInitials(authorName).charAt(0)}</Text>
        </View>
        <Text style={styles.piAuthor} numberOfLines={1}>
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
  return (
    <View style={styles.ap}>
      <View style={styles.apProviderRow}>
        <View style={[styles.apDot, { backgroundColor: platform === "android" ? "#00D084" : "#0A60FE" }]} />
        <Text style={styles.apProvider}>{platform === "android" ? "Google Play" : "App Store"}</Text>
      </View>
      <View style={styles.apRow}>
        {image ? (
          <Image source={{ uri: image }} style={styles.apIcon} resizeMode="cover" />
        ) : (
          <View style={[styles.apIcon, styles.apIconFallback]}>
            <Text style={styles.apIconText}>{getInitials(title).charAt(0)}</Text>
          </View>
        )}
        <View style={styles.apCol}>
          <Text style={styles.apTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.apDeveloper} numberOfLines={1}>
            {developer}
          </Text>
          {downloads ? (
            <View style={styles.apDownloadRow}>
              <Download size={11} color="#555555" strokeWidth={2} />
              <Text style={styles.apDownloadText} numberOfLines={1}>
                {downloads}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {category ? (
        <View style={styles.apCategoryChip}>
          <Text style={styles.apCategoryText} numberOfLines={1}>
            {category}
          </Text>
        </View>
      ) : null}
      {description ? (
        <Text style={styles.apDesc} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      {price || rating != null ? (
        <View style={styles.apFooter}>
          {price ? (
            <Text style={styles.apPrice} numberOfLines={1}>
              {price}
            </Text>
          ) : null}
          {rating != null ? (
            <View style={styles.apRatingRow}>
              <Star size={11} color="#111111" fill="#111111" strokeWidth={1} />
              <Text style={styles.apRatingText}>
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
  return (
    <View style={styles.sy}>
      <View style={styles.syProviderRow}>
        <View style={styles.syDot} />
        <Text style={styles.syProvider}>Airbnb</Text>
        {rating != null ? (
          <View style={styles.syRatingRow}>
            <Star size={11} color="#111111" fill="#111111" strokeWidth={1} />
            <Text style={styles.syRatingText}>
              {rating.toFixed(1)}
              {reviews != null ? ` (${formatCompact(reviews)})` : ""}
            </Text>
          </View>
        ) : null}
      </View>
      {image ? (
        <View style={styles.syImageWrap}>
          <Image source={{ uri: image }} style={styles.syImage} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={styles.syTitle} numberOfLines={2}>
        {title}
      </Text>
      {location ? (
        <View style={styles.syMetaRow}>
          <MapPin size={12} color="#FF385C" strokeWidth={2} />
          <Text style={styles.syMetaText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      ) : null}
      {host ? (
        <Text style={styles.syHost} numberOfLines={1}>
          Hosted by {host}
        </Text>
      ) : null}
      {price ? (
        <Text style={styles.syPrice} numberOfLines={1}>
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
  return (
    <View style={styles.gm}>
      <View style={styles.gmProviderRow}>
        <View style={styles.gmDot} />
        <Text style={styles.gmProvider}>Steam</Text>
        {metacritic != null ? (
          <View style={styles.gmMetaChip}>
            <Text style={styles.gmMetaText}>{Math.round(metacritic)}</Text>
          </View>
        ) : null}
      </View>
      {image ? (
        <View style={styles.gmImageWrap}>
          <Image source={{ uri: image }} style={styles.gmImage} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={styles.gmTitle} numberOfLines={2}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.gmDesc} numberOfLines={2}>
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
            <Text style={styles.gmRelease} numberOfLines={1}>
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
  return (
    <View style={styles.bk}>
      <View style={styles.bkProviderRow}>
        <View style={styles.bkDot} />
        <Text style={styles.bkProvider}>Book</Text>
      </View>
      <View style={styles.bkRow}>
        {image ? (
          <Image source={{ uri: image }} style={styles.bkCover} resizeMode="cover" />
        ) : (
          <View style={[styles.bkCover, styles.bkCoverFallback]}>
            <BookOpen size={24} color="#754C1E" strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.bkCol}>
          <Text style={styles.bkTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.bkAuthor} numberOfLines={1}>
            {authorName}
          </Text>
        </View>
      </View>
      {rating != null || pages != null ? (
        <View style={styles.bkMetaRow}>
          {rating != null ? (
            <View style={styles.bkRating}>
              <Star size={12} color="#B45309" fill="#B45309" strokeWidth={1} />
              <Text style={styles.bkRatingText}>
                {rating.toFixed(1)}
                {reviews != null ? ` (${formatCompact(reviews)})` : ""}
              </Text>
            </View>
          ) : null}
          {pages != null ? (
            <Text style={styles.bkPages}>{pages} pages</Text>
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
  return (
    <View style={styles.lc}>
      <View style={styles.lcProviderRow}>
        <View style={styles.lcDot} />
        <Text style={styles.lcProvider}>Product Hunt</Text>
      </View>
      <View style={styles.lcTitleRow}>
        <ArrowBigUp size={32} color="#FF6154" strokeWidth={2} />
        <Text style={styles.lcTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>
      {tagline ? (
        <Text style={styles.lcTagline} numberOfLines={2}>
          {tagline}
        </Text>
      ) : null}
      <View style={styles.lcFooter}>
        <View style={styles.lcAvatar}>
          <Text style={styles.lcAvatarText}>{getInitials(maker).charAt(0)}</Text>
        </View>
        <Text style={styles.lcMaker} numberOfLines={1}>
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
}) {
  const sub =
    kind === "live"
      ? (watchingLabel ||
        (concurrentViewers != null
          ? `${formatCompact(concurrentViewers)} watching`
          : "Live now"))
      : kind === "premiere"
        ? (scheduledLabel ? `Premieres ${scheduledLabel}` : "Premiere")
        : [
            views != null ? `${formatCompact(views)} views` : null,
            age,
            kind === "short" ? "Short" : null,
          ]
            .filter(Boolean)
            .join(" • ") || null;

  return (
    <View style={styles.yt}>
      <View style={styles.ytProviderRow}>
        <View style={styles.ytDot} />
        <Text style={styles.ytProvider} numberOfLines={1}>
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
      <Text style={styles.ytTitle} numberOfLines={isStory ? 3 : 2}>
        {title}
      </Text>
      {sub ? (
        <Text style={styles.ytSub} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
      {thumb ? (
        <View style={styles.ytThumbWrap}>
          <Image source={{ uri: thumb }} style={styles.ytThumb} resizeMode="cover" />
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
          <View style={[styles.ytChannelAvatar, styles.ytChannelFallback]}>
            <Text style={styles.ytChannelInitial}>{getInitials(channel)}</Text>
          </View>
        )}
        <Text style={styles.ytChannel} numberOfLines={1}>
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
  likeCount,
  replyCount,
  avatar,
}: {
  body: string;
  authorName: string;
  handle: string | null;
  verified: boolean;
  timeLabel: string;
  likeCount: number | null;
  replyCount: number | null;
  avatar: string | null;
}) {
  return (
    <View style={styles.tw}>
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
            <Text style={styles.twName} numberOfLines={1}>
              {authorName}
            </Text>
            {verified ? <VerifiedDot size={15} /> : null}
          </View>
          <Text style={styles.twHandle} numberOfLines={1}>
            {handle ? `@${handle} · ` : ""}{timeLabel}
          </Text>
        </View>
        <XLogo size={18} />
      </View>
      <Text style={styles.twBody} numberOfLines={6}>
        {body}
      </Text>
      <View style={styles.twFooter}>
        <View style={styles.twStat}>
          <Heart
            size={14}
            color={likeCount ? "#F91880" : "#536471"}
            fill={likeCount ? "#F91880" : "transparent"}
            strokeWidth={2}
          />
          {likeCount != null ? (
            <Text style={styles.twStatText}>{formatCount(likeCount)}</Text>
          ) : null}
        </View>
        <View style={styles.twStat}>
          <MessageCircle size={14} color="#536471" strokeWidth={2} />
          <Text style={styles.twStatText}>
            {replyCount != null && replyCount > 0 ? formatCount(replyCount) : "Reply"}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---------------- Template A: white Medium-style editorial card ---------------- */

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
  image,
  favicon,
}: {
  isStory: boolean;
  cardWidth: number;
  title: string;
  excerpt: string;
  authorName: string;
  minutes: number;
  image: string | null;
  favicon: string | null;
}) {
  const size = useImageSize(image);
  const hasSize = size.loaded && size.width > 0 && size.height > 0;

  const footer = (
    <View style={styles.edFooter}>
      {favicon ? (
        <Image source={{ uri: favicon }} style={styles.edAvatar} resizeMode="cover" />
      ) : (
        <View style={styles.edAvatar}>
          <Text style={styles.edAvatarText}>{getInitials(authorName)}</Text>
        </View>
      )}
      <Text style={styles.edAuthor} numberOfLines={1}>
        {authorName}
      </Text>
      <Text style={styles.edReadTime} numberOfLines={1}>
        {`${minutes} min read`}
      </Text>
    </View>
  );

  if (image && hasSize) {
    const heroRatio = size.width / size.height;
    // Actual usable card width: 88% scene − 1px borders − 16px padding each side.
    const contentWidth = Math.max(120, cardWidth * CARD_W_RATIO - 34);
    // Keep enough room for metadata while allowing portrait assets to grow.
    const heroMax = Math.max(160, contentWidth * (heroRatio < 1 ? 1.05 : 0.72));
    const heroHeight = Math.min(contentWidth / heroRatio, heroMax);

    return (
      <View style={styles.editorial}>
        <View style={[styles.dynHeroWrap, styles.dynHeroFirst, { height: heroHeight }]}>
          <Image source={{ uri: image }} style={styles.dynHero} resizeMode="contain" />
        </View>
        <Text style={[styles.edTitle, styles.dynTitleBelowHero]} numberOfLines={2}>
          {title}
        </Text>
        {excerpt ? (
          <Text style={[styles.edExcerpt, styles.dynExcerptBelowHero]} numberOfLines={2}>
            {excerpt}
          </Text>
        ) : null}
        {footer}
      </View>
    );
  }

  return (
    <View style={styles.editorial}>
      <Text style={styles.edTitle} numberOfLines={isStory ? 3 : 2}>
        {title}
      </Text>
      <View style={styles.edRow}>
        {excerpt ? (
          <Text style={styles.edExcerpt} numberOfLines={3}>
            {excerpt}
          </Text>
        ) : null}
        {image ? (
          <Image source={{ uri: image }} style={styles.edThumb} resizeMode="cover" />
        ) : null}
      </View>
      {footer}
    </View>
  );
}

/* ---------------- Template B: dark immersive travel card ---------------- */

function SpotlightCard({
  isStory,
  title,
  excerpt,
  authorName,
  minutes,
  dateLabel,
  pill,
  image,
}: {
  isStory: boolean;
  title: string;
  excerpt: string;
  authorName: string;
  minutes: number;
  dateLabel: string;
  pill: string;
  image: string | null;
}) {
  return (
    <View style={styles.spot}>
      <View style={styles.spotMeta}>
        {pill ? (
          <View style={styles.spotPill}>
            <MapPin size={11} color="#FACC15" strokeWidth={2.5} />
            <Text style={styles.spotPillText} numberOfLines={1}>
              {pill}
            </Text>
          </View>
        ) : null}
        <Text style={styles.spotMetaText} numberOfLines={1}>
          {dateLabel} • {`${minutes} min read`}
        </Text>
      </View>
      <Text style={styles.spotTitle} numberOfLines={isStory ? 3 : 2}>
        {title}
      </Text>
      {excerpt ? (
        <Text style={styles.spotExcerpt} numberOfLines={3}>
          {excerpt}
        </Text>
      ) : null}
      {image ? (
        <View style={styles.spotHeroWrap}>
          <Image source={{ uri: image }} style={styles.spotHero} resizeMode="cover" />
        </View>
      ) : null}
      <View style={styles.spotFooter}>
        <View style={styles.spotAvatar}>
          <Text style={styles.spotAvatarText}>{getInitials(authorName).charAt(0)}</Text>
        </View>
        <Text style={styles.spotAuthor} numberOfLines={1}>
          {authorName}
        </Text>
      </View>
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

  /* editorial embed */
  editorial: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  dynHeroWrap: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    marginTop: 10,
  },
  dynHeroFirst: {
    marginTop: 0,
  },
  dynHero: {
    width: "100%",
    height: "100%",
  },
  dynTitleBelowHero: {
    marginTop: 10,
  },
  dynExcerptBelowHero: {
    marginTop: 10,
    flex: 0,
  },
  edTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: "#161616",
    letterSpacing: -0.3,
  },
  edRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  edExcerpt: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#525252",
  },
  edThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  edFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  edAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  edAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  edAuthor: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
  },
  edReadTime: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "500",
  },

  /* spotlight embed */
  spot: {
    backgroundColor: "#0D1A3F",
    padding: 16,
  },
  spotMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  spotPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(8,14,34,0.85)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.4)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: "55%",
  },
  spotPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  spotMetaText: {
    flex: 1,
    fontSize: 12,
    color: "#CBD5E1",
    fontWeight: "500",
  },
  spotTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  spotExcerpt: {
    fontSize: 14,
    lineHeight: 21,
    color: "#B9C1D6",
    marginTop: 8,
  },
  spotHeroWrap: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#16265A",
  },
  spotHero: {
    width: "100%",
    height: "100%",
  },
  spotFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2A407C",
  },
  spotAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(253,224,71,0.14)",
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  spotAvatarText: {
    color: "#FDE047",
    fontWeight: "800",
    fontSize: 13,
  },
  spotAuthor: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
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
    marginTop: 10,
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
});

export default LinkCardView;
