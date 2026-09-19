import { getWorkerBaseUrl, getYouTubeWorkerUrl } from "@/lib/config";

export type YouTubeKind = "video" | "short" | "live" | "premiere";

export type SpotifyKind = "track" | "album" | "playlist" | "artist" | "show" | "episode";

export type TwitchKind = "live" | "clip" | "video" | "channel";

export type CommerceStore = "amazon" | "flipkart" | "meesho" | "ebay" | "etsy" | "aliexpress" | "walmart" | "other";

export type LinkPreview = {
  url: string;
  title: string;
  description: string;
  image: string | null;
  /** Worker-backed fallback for remote images that reject direct app requests. */
  imageFallback?: string | null;
  /** Best-effort site favicon (used by the generic card's publisher row). */
  favicon: string | null;
  siteName: string | null;
  author: string | null;
  readingMinutes: number | null;
  publishedAt: string | null;
  /** True when the URL is an X/Twitter status link. */
  isTweet: boolean;
  /** e.g. "theo" (without @). */
  handle: string | null;
  /** Profile photo URL when known. */
  avatar: string | null;
  verified: boolean;
  likeCount: number | null;
  replyCount: number | null;
  /** True when the URL is a YouTube video/shorts/live link. */
  isYouTube: boolean;
  youtubeKind: YouTubeKind | null;
  /** 11-char video id when known. */
  youtubeId: string | null;
  durationSec: number | null;
  viewCount: number | null;
  channelThumb: string | null;
  scheduledStart: string | null;
  concurrentViewers: number | null;
  /** Twitch (Helix via Worker; manual fallback without creds). */
  isTwitch: boolean;
  twitchKind: TwitchKind | null;
  twitchLogin: string | null;
  gameName: string | null;
  viewerCount: number | null;
  /** TikTok clip (official oEmbed, no auth). */
  isTikTok: boolean;
  tiktokId: string | null;
  /** Reddit post (official oEmbed + .json enrichment). */
  isReddit: boolean;
  subreddit: string | null;
  postScore: number | null;
  commentCount: number | null;
  createdUtc: number | null;
  /** Spotify entity (official oEmbed, no auth). */
  isSpotify: boolean;
  spotifyKind: SpotifyKind | null;
  spotifyId: string | null;
  /** GitHub repo (public REST API, no auth). */
  isGitHub: boolean;
  repoFullName: string | null;
  repoStars: number | null;
  repoForks: number | null;
  repoLanguage: string | null;
  /** Commerce product (store-detected; eBay JSON-LD parsed, rest best-effort). */
  isCommerce: boolean;
  commerceStore: CommerceStore | null;
  commercePrice: string | null;
  commerceMrp: string | null;
  commerceRating: number | null;
  commerceReviews: number | null;
  commerceSeller: string | null;
  /** Product condition label (eBay: "New", "Used", "Open box"). */
  commerceCondition: string | null;
  /** Seller feedback score, e.g. "(4,231)" (eBay). */
  commerceSellerFeedback: string | null;
  /** Seller positive-feedback % (eBay). */
  sellerFeedbackPercent: number | null;
  /** Sold/available text, e.g. "28 sold" / "10+ available" (eBay). */
  commerceSold: string | null;
  /** LinkedIn post (OG/manual; template auto-selects the LinkedIn layout). */
  isLinkedIn: boolean;
  headline: string | null;
  repostCount: number | null;
  /** Indeed job posting (JobPosting JSON-LD when fetchable). */
  isIndeed: boolean;
  salary: string | null;
  jobType: string | null;
  jobLocation: string | null;
  /** Zomato / Swiggy restaurant (OG + Restaurant JSON-LD, best-effort). */
  isZomato: boolean;
  isSwiggy: boolean;
  cuisine: string | null;
  area: string | null;
  eta: string | null;
  /** Pinterest pin (OG tags). */
  isPinterest: boolean;
  /** App Store / Play Store app (iTunes lookup API keyless; Play via OG). */
  isApp: boolean;
  appPlatform: "ios" | "android" | null;
  downloads: string | null;
  category: string | null;
  /** Airbnb / stay listing (OG + markdown, best-effort). */
  isStay: boolean;
  hostName: string | null;
  /** Steam game (keyless storefront API). */
  isGame: boolean;
  genre: string | null;
  releaseDate: string | null;
  /** Book (Goodreads Book JSON-LD / Open Library, best-effort). */
  isBook: boolean;
  pages: number | null;
  /** Product Hunt launch (OG tags; upvotes manual). */
  isLaunch: boolean;
  tagline: string | null;
  upvotes: number | null;
  /** YouTube Music (music.youtube.com) — same worker data as YouTube. */
  isYouTubeMusic: boolean;
  /** JioSaavn track/album/playlist. */
  isJioSaavn: boolean;
  /** Gaana track/album/playlist. */
  isGaana: boolean;
  /** Apple Music entity (music.apple.com). */
  isAppleMusic: boolean;
  /** Netflix title page. */
  isNetflix: boolean;
  /** Amazon Prime Video title. */
  isPrimeVideo: boolean;
  /** Disney+ Hotstar title. */
  isHotstar: boolean;
  /** Pocket FM audio-series episode. */
  isPocketFm: boolean;
  /** Kuku FM audio-series episode. */
  isKukuFm: boolean;
  /** Apple Podcasts episode (podcasts.apple.com). */
  isApplePodcasts: boolean;
  /** Wattpad story. */
  isWattpad: boolean;
  /** Pratilipi story/novel. */
  isPratilipi: boolean;
  /** Webtoon comic. */
  isWebtoon: boolean;
  /** Amazon Kindle book (amazon.* book pages). */
  isKindle: boolean;
  /** Medium article. */
  isMedium: boolean;
  /** Blogger / Blogspot article. */
  isBlogspot: boolean;
  /** DEV Community (dev.to) article. */
  isDevTo: boolean;
  /** LinkedIn Pulse long-form article (linkedin.com/pulse/). */
  isLinkedInArticle: boolean;
  /** X (Twitter) long-form article (x.com/i/article or article-wrapped status). */
  isXArticle: boolean;
  /** Substack post. */
  isSubstack: boolean;
  /** WordPress.com post. */
  isWordPress: boolean;
  /** Hashnode article. */
  isHashnode: boolean;
  /** Walmart product page. */
  isWalmart: boolean;
  /** Article tags/labels (dev.to tags, Blogger labels, Hashnode tags). */
  tags: string[] | null;
};

export type TwitchWorkerPayload = {
  kind: TwitchKind;
  id: string;
  title: string;
  streamerName: string;
  streamerLogin?: string;
  creatorName?: string;
  profileImage?: string | null;
  gameName?: string | null;
  thumbnail?: string | null;
  viewCount?: number | null;
  viewerCount?: number | null;
  durationSec?: number | null;
  createdAt?: string | null;
  startedAt?: string | null;
  url?: string | null;
};

/** Defaults for all platform-specific fields (spread into every constructor). */
function platformDefaults() {
  return {
    favicon: null as string | null,
    isTwitch: false,
    twitchKind: null as TwitchKind | null,
    twitchLogin: null as string | null,
    gameName: null as string | null,
    viewerCount: null as number | null,
    isTikTok: false,
    tiktokId: null as string | null,
    isReddit: false,
    subreddit: null as string | null,
    postScore: null as number | null,
    commentCount: null as number | null,
    createdUtc: null as number | null,
    isSpotify: false,
    spotifyKind: null as SpotifyKind | null,
    spotifyId: null as string | null,
    isGitHub: false,
    repoFullName: null as string | null,
    repoStars: null as number | null,
    repoForks: null as number | null,
    repoLanguage: null as string | null,
    isCommerce: false,
    commerceStore: null as CommerceStore | null,
    commercePrice: null as string | null,
    commerceMrp: null as string | null,
    commerceRating: null as number | null,
    commerceReviews: null as number | null,
    commerceSeller: null as string | null,
    commerceCondition: null as string | null,
    commerceSellerFeedback: null as string | null,
    sellerFeedbackPercent: null as number | null,
    commerceSold: null as string | null,
    isLinkedIn: false,
    headline: null as string | null,
    repostCount: null as number | null,
    isIndeed: false,
    salary: null as string | null,
    jobType: null as string | null,
    jobLocation: null as string | null,
    isZomato: false,
    isSwiggy: false,
    cuisine: null as string | null,
    area: null as string | null,
    eta: null as string | null,
    isPinterest: false,
    isApp: false,
    appPlatform: null as "ios" | "android" | null,
    downloads: null as string | null,
    category: null as string | null,
    isStay: false,
    hostName: null as string | null,
    isGame: false,
    genre: null as string | null,
    releaseDate: null as string | null,
    isBook: false,
    pages: null as number | null,
    isLaunch: false,
    tagline: null as string | null,
    upvotes: null as number | null,
    isYouTubeMusic: false,
    isJioSaavn: false,
    isGaana: false,
    isAppleMusic: false,
    isNetflix: false,
    isPrimeVideo: false,
    isHotstar: false,
    isPocketFm: false,
    isKukuFm: false,
    isApplePodcasts: false,
    isWattpad: false,
    isPratilipi: false,
    isWebtoon: false,
    isKindle: false,
    isMedium: false,
    isBlogspot: false,
    isDevTo: false,
    isLinkedInArticle: false,
    isXArticle: false,
    isSubstack: false,
    isWordPress: false,
    isHashnode: false,
    isWalmart: false,
    tags: null as string[] | null,
  };
}

export type YouTubeWorkerPayload = {
  id: string;
  kind: YouTubeKind;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string | null;
  thumbnail: string | null;
  durationIso: string | null;
  durationSec: number | null;
  viewCount: number | null;
  likeCount: number | null;
  scheduledStartTime: string | null;
  concurrentViewers: number | null;
};

const TWEET_RE = /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/i;

export function isTweetUrl(url: string): boolean {
  return TWEET_RE.test(url.trim());
}

function tweetFallback(url: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "X",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: true,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
  };
}

/** Parse a `publish.twitter.com/oembed` response into a preview. */
export function parseTweetOembed(json: {
  author_name?: string;
  author_url?: string;
  html?: string;
}, url: string): LinkPreview {
  const base = tweetFallback(url);
  const html = json.html || "";
  const author = (json.author_name || "").trim() || null;
  let handle: string | null = null;
  if (json.author_url) {
    const m = json.author_url.match(/(?:x\.com|twitter\.com)\/([^/?#]+)/i);
    if (m) handle = m[1];
  }
  if (!handle) {
    const m = html.match(/@([A-Za-z0-9_]{1,15})/);
    if (m) handle = m[1];
  }
  // Tweet body: first <p>…</p> inside the blockquote; <br> → newline, strip tags.
  let text = "";
  const p = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (p) {
    text = p[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    text = decodeEntities(text);
    // oEmbed appends pic/link tails like "pic.twitter.com/xyz" — keep them, they're part of the tweet.
  }
  // Author avatar is not included in oEmbed reliably; best-effort <img>
  // extraction, falling back to the handle-based avatar resolver.
  let avatar: string | null = null;
  const img = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (img) avatar = img[1];
  if (!avatar && handle) avatar = `https://unavatar.io/x/${handle}`;

  return {
    ...base,
    title: text,
    author,
    handle,
    avatar,
    image: avatar,
  };
}

async function fetchTweetPreview(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object") return null;
    return parseTweetOembed(json, url);
  } catch {
    return null;
  }
}

/* ---------------- YouTube ---------------- */

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Extract the 11-char video id from watch/shorts/live/youtu.be/embed URLs. */
export function parseYouTubeId(input: string): string | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\.|^music\./, "").toLowerCase();
  const segs = u.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = segs[0] || "";
    return YT_ID_RE.test(id) ? id : null;
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    for (const prefix of ["shorts", "live", "embed", "v"]) {
      if (segs[0] === prefix && segs[1] && YT_ID_RE.test(segs[1])) return segs[1];
    }
    if (segs[0] === "watch") {
      const id = u.searchParams.get("v") || "";
      return YT_ID_RE.test(id) ? id : null;
    }
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeId(url) != null;
}

/** URL-only kind hint. Live/premiere truth comes from the Data API layer. */
export function youtubeKindFromUrl(url: string): YouTubeKind {
  try {
    const u = new URL(url.trim());
    if (u.pathname.startsWith("/shorts/")) return "short";
    if (u.pathname.startsWith("/live/")) return "live";
  } catch {
    // fall through
  }
  return "video";
}

function youtubeFallback(url: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "YouTube",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: true,
    youtubeKind: youtubeKindFromUrl(url),
    youtubeId: parseYouTubeId(url),
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
  };
}

/** Map the Cloudflare Worker payload onto a preview. */
export function parseYouTubeWorker(p: YouTubeWorkerPayload, url: string): LinkPreview {
  const base = youtubeFallback(url);
  return {
    ...base,
    title: (p.title || "").trim(),
    author: (p.channelTitle || "").trim() || null,
    image: p.thumbnail,
    publishedAt: p.publishedAt,
    youtubeKind: p.kind,
    youtubeId: p.id,
    durationSec: p.durationSec,
    viewCount: p.viewCount,
    scheduledStart: p.scheduledStartTime,
    concurrentViewers: p.concurrentViewers,
  };
}

async function fetchYouTubeViaWorker(url: string): Promise<LinkPreview | null> {
  const worker = getYouTubeWorkerUrl();
  if (!worker) return null;
  try {
    const res = await fetch(`${worker}/yt?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object" || !("id" in json)) return null;
    return parseYouTubeWorker(json as YouTubeWorkerPayload, url);
  } catch {
    return null;
  }
}

/** No-auth oEmbed: title + channel + thumbnail only. */
async function fetchYouTubeOembed(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
    };
    if (!json || !json.title) return null;
    const base = youtubeFallback(url);
    const handle =
      (json.author_url || "").match(/(?:youtube\.com|youtu\.be)\/(@[^/?#]+)/i)?.[1] || null;
    return {
      ...base,
      title: json.title,
      author: json.author_name || null,
      handle,
      avatar: handle ? `https://unavatar.io/youtube/${handle.slice(1)}` : null,
      image: json.thumbnail_url || null,
    };
  } catch {
    return null;
  }
}

/**
 * Best-effort enrichment from watch-page HTML (works on native; CORS-blocked
 * on web, where this simply yields nothing and the chain moves on).
 */
function overlayYouTubeScrape(base: LinkPreview, html: string): LinkPreview {
  const out = { ...base };
  const len = html.match(/"lengthSeconds":"(\d+)"/);
  if (len) out.durationSec = Number(len[1]);
  const views = html.match(/"viewCount":"(\d+)"/);
  if (views) out.viewCount = Number(views[1]);
  // Channel avatar from the embedded player response (microformat) or, failing
  // that, the owner renderer inside ytInitialData. Avoids the initials dummy.
  const chThumb =
    html.match(/"channelThumbnail":\{"thumbnails":\[\{"url":"([^"]+)"/) ||
    html.match(/"videoOwnerRenderer":\{"thumbnail":\{"thumbnails":\[\{"url":"([^"]+)"/);
  if (chThumb) {
    const avatar = chThumb[1].replace(/\\\//g, "/");
    out.channelThumb = avatar;
    out.avatar = avatar;
  }
  // Channel name lives in videoDetails ("viewCount" and "author" are adjacent
  // there). Without this the card falls back to the "YouTube" site label.
  const vdAuthor = html.match(/"viewCount":"\d+","author":"((?:[^"\\]|\\.)*)"/);
  if (vdAuthor) {
    try {
      const name = JSON.parse(`"${vdAuthor[1]}"`);
      if (typeof name === "string" && name.trim()) out.author = name.trim();
    } catch {
      /* keep existing author */
    }
  }
  if (/"isLiveContent":true/.test(html)) out.youtubeKind = "live";
  else if (/"isUpcoming":true/.test(html)) out.youtubeKind = "premiere";
  return out;
}

async function fetchYouTubePreview(url: string): Promise<LinkPreview | null> {
  // 1. Cloudflare Worker + Data API (exact metadata, works on all platforms)
  const viaWorker = await fetchYouTubeViaWorker(url);
  if (viaWorker) return viaWorker;

  // 2. Watch-page HTML (native): OG tags + best-effort player fields
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) {
        const og = parseOpenGraph(text, url);
        return overlayYouTubeScrape(
          {
            ...youtubeFallback(url),
            title: og.title === url ? "" : og.title,
            description: og.description,
            image: og.image,
            siteName: "YouTube",
            author: og.author || youtubeFallback(url).author,
          },
          text,
        );
      }
    }
  } catch {
    // CORS / network — move on
  }

  // 3. oEmbed (title/channel/thumb)
  const oembed = await fetchYouTubeOembed(url);
  if (oembed) return oembed;

  return null;
}

/* ---------------- Twitch (Helix via Worker; manual fallback) ---------------- */

const TWITCH_LOGIN_RE = /^[a-zA-Z0-9_]{1,25}$/;

export type TwitchTarget =
  | { kind: "clip"; slug: string }
  | { kind: "video"; id: string }
  | { kind: "channel"; login: string };

export function parseTwitchUrl(input: string): TwitchTarget | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const segs = u.pathname.split("/").filter(Boolean);

  if (host === "clips.twitch.tv") {
    return segs[0] ? { kind: "clip", slug: segs[0] } : null;
  }
  if (host !== "twitch.tv" && !host.endsWith(".twitch.tv")) return null;
  if (segs[0] === "videos" && segs[1] && /^\d+$/.test(segs[1])) {
    return { kind: "video", id: segs[1] };
  }
  const clipIdx = segs.indexOf("clip");
  if (clipIdx >= 0 && segs[clipIdx + 1]) {
    return { kind: "clip", slug: segs[clipIdx + 1] };
  }
  if (segs.length >= 1 && TWITCH_LOGIN_RE.test(segs[0])) {
    return { kind: "channel", login: segs[0].toLowerCase() };
  }
  return null;
}

export function isTwitchUrl(url: string): boolean {
  return parseTwitchUrl(url) != null;
}

function twitchFallback(url: string): LinkPreview {
  const target = parseTwitchUrl(url);
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "Twitch",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
    isTwitch: true,
    twitchKind:
      target?.kind === "clip" ? "clip" : target?.kind === "video" ? "video" : "channel",
    twitchLogin: target?.kind === "channel" ? target.login : null,
  };
}

/** Map the Worker /twitch payload onto a preview. */
export function parseTwitchWorker(p: TwitchWorkerPayload, url: string): LinkPreview {
  const base = twitchFallback(url);
  const live = p.kind === "live";
  return {
    ...base,
    title: (p.title || "").trim(),
    author: (p.streamerName || "").trim() || null,
    avatar: p.profileImage || null,
    image: p.thumbnail || p.profileImage || null,
    publishedAt: p.startedAt || p.createdAt || null,
    twitchKind: p.kind,
    twitchLogin: (p.streamerLogin || "").toLowerCase() || base.twitchLogin,
    gameName: p.gameName || null,
    viewerCount: live ? (p.viewerCount ?? null) : null,
    viewCount: !live ? (p.viewCount ?? null) : null,
    durationSec: p.durationSec ?? null,
  };
}

async function fetchTwitchPreview(url: string): Promise<LinkPreview | null> {
  const worker = getWorkerBaseUrl();
  if (!worker) return null;
  try {
    const res = await fetch(`${worker}/twitch?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null; // missing creds / unknown channel → manual fallback
    const json = await res.json();
    if (!json || typeof json !== "object" || !("kind" in json)) return null;
    return parseTwitchWorker(json as TwitchWorkerPayload, url);
  } catch {
    return null;
  }
}

/* ---------------- TikTok (official oEmbed, key-free) ---------------- */

const TIKTOK_HOSTS = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]);

export function isTikTokUrl(url: string): boolean {
  try {
    return TIKTOK_HOSTS.has(new URL(url.trim()).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Parse /@user/video/<id>. Short links (vm/vt) resolve via oEmbed's id. */
export function parseTikTok(input: string): { user: string | null; id: string | null } {
  try {
    const u = new URL(input.trim());
    const m = u.pathname.match(/@([^/]+)\/video\/(\d+)/);
    if (m) return { user: m[1], id: m[2] };
  } catch {
    // fall through
  }
  return { user: null, id: null };
}

export function parseTikTokOembed(json: {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  embed_product_id?: string;
}, url: string): LinkPreview {
  const base = tiktokFallback(url);
  const parsed = parseTikTok(url);
  let handle: string | null = null;
  if (json.author_url) {
    const m = json.author_url.match(/@([^/?#]+)/);
    if (m) handle = m[1];
  }
  return {
    ...base,
    title: decodeEntities((json.title || "").trim()),
    author: (json.author_name || "").trim() || null,
    handle: handle || parsed.user,
    image: json.thumbnail_url || null,
    tiktokId: json.embed_product_id || parsed.id,
  };
}

function tiktokFallback(url: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "TikTok",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
    isTikTok: true,
  };
}

async function fetchTikTokPreview(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object" || !json.title) return null;
    return parseTikTokOembed(json, url);
  } catch {
    return null;
  }
}

/* ---------------- Reddit (official oEmbed + .json enrichment) ---------------- */

const REDDIT_HOSTS = new Set(["reddit.com", "www.reddit.com", "old.reddit.com", "new.reddit.com", "redd.it"]);

export function isRedditUrl(url: string): boolean {
  try {
    return REDDIT_HOSTS.has(new URL(url.trim()).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function redditFallback(url: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "Reddit",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
    isReddit: true,
  };
}

function cleanRedditThumb(t: unknown): string | null {
  if (typeof t !== "string" || !t.startsWith("http")) return null;
  if (t === "self" || t === "default" || t === "nsfw" || t === "spoiler") return null;
  return t.replace(/&amp;/g, "&");
}

export function parseRedditJson(json: unknown, url: string): LinkPreview | null {
  try {
    const listing = Array.isArray(json) ? json[0] : json;
    const post = listing?.data?.children?.[0]?.data;
    if (!post || !post.title) return null;
    const base = redditFallback(url);
    const previewImg = post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") || null;
    return {
      ...base,
      title: String(post.title),
      description: typeof post.selftext === "string" ? post.selftext.slice(0, 300) : "",
      author: post.author ? String(post.author) : null,
      subreddit: post.subreddit ? String(post.subreddit) : null,
      image: previewImg || cleanRedditThumb(post.thumbnail),
      postScore: typeof post.score === "number" ? post.score : null,
      replyCount: typeof post.num_comments === "number" ? post.num_comments : null,
      commentCount: typeof post.num_comments === "number" ? post.num_comments : null,
      createdUtc: typeof post.created_utc === "number" ? post.created_utc : null,
      publishedAt:
        typeof post.created_utc === "number"
          ? new Date(post.created_utc * 1000).toISOString()
          : null,
    };
  } catch {
    return null;
  }
}

export function parseRedditOembed(json: {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
}, url: string): LinkPreview {
  const base = redditFallback(url);
  const sub = url.match(/\/r\/([^/?#]+)/i)?.[1] || null;
  return {
    ...base,
    title: (json.title || "").trim(),
    author: (json.author_name || "").trim() || null,
    subreddit: sub,
    image: json.thumbnail_url || null,
  };
}

async function fetchRedditPreview(url: string): Promise<LinkPreview | null> {
  // 1. .json enrichment (score/comments/subreddit). Needs no auth.
  try {
    const canon = url.split("?")[0].split("#")[0].replace(/\/$/, "");
    const res = await fetch(`${canon}.json`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const parsed = parseRedditJson(await res.json(), url);
      if (parsed) return parsed;
    }
  } catch {
    // rate-limited / blocked — fall through to oEmbed
  }
  // 2. oEmbed (title/author/thumb, works everywhere)
  try {
    const res = await fetch(
      `https://www.reddit.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object" || !json.title) return null;
    return parseRedditOembed(json, url);
  } catch {
    return null;
  }
}

/* ---------------- Spotify (official oEmbed, key-free) ---------------- */

export function parseSpotify(input: string): { kind: SpotifyKind; id: string } | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.endsWith("spotify.com")) return null;
    const segs = u.pathname.split("/").filter(Boolean);
    const kinds: SpotifyKind[] = ["track", "album", "playlist", "artist", "show", "episode"];
    if (segs.length >= 2 && kinds.includes(segs[0] as SpotifyKind) && /^[A-Za-z0-9]{22}$/.test(segs[1])) {
      return { kind: segs[0] as SpotifyKind, id: segs[1] };
    }
  } catch {
    // fall through
  }
  return null;
}

export function isSpotifyUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    if (host === "spotify.link") return true;
    return parseSpotify(url) != null;
  } catch {
    return false;
  }
}

function spotifyFallback(url: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "Spotify",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
    isSpotify: true,
  };
}

export function parseSpotifyOembed(json: {
  title?: string;
  thumbnail_url?: string;
}, url: string): LinkPreview {
  const base = spotifyFallback(url);
  const parsed = parseSpotify(url);
  return {
    ...base,
    title: decodeEntities((json.title || "").trim()),
    image: json.thumbnail_url || null,
    spotifyKind: parsed?.kind || null,
    spotifyId: parsed?.id || null,
  };
}

async function fetchSpotifyPreview(url: string): Promise<LinkPreview | null> {
  // spotify.link short URLs: follow the redirect, then parse the canonical URL.
  let canon = url;
  if (canon.includes("spotify.link")) {
    try {
      const r = await fetch(canon);
      if (r.url && parseSpotify(r.url)) canon = r.url;
    } catch {
      // fall through with the original URL
    }
  }
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(canon)}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object" || !json.title) return null;
    return parseSpotifyOembed(json, canon);
  } catch {
    return null;
  }
}

/* ---------------- GitHub (public REST API, no auth) ---------------- */

export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(input.trim());
    if (u.hostname.replace(/^www\./, "").toLowerCase() !== "github.com") return null;
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length >= 2 && /^[\w.-]+$/.test(segs[0]) && /^[\w.-]+$/.test(segs[1].replace(/\.git$/, ""))) {
      return { owner: segs[0], repo: segs[1].replace(/\.git$/, "") };
    }
  } catch {
    // fall through
  }
  return null;
}

export function isGitHubUrl(url: string): boolean {
  return parseGitHubRepo(url) != null;
}

function githubFallback(url: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName: "GitHub",
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
    isGitHub: true,
  };
}

export function parseGitHubRepoJson(json: {
  full_name?: string;
  description?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  owner?: { login?: string; avatar_url?: string };
  updated_at?: string;
}, url: string): LinkPreview {
  const base = githubFallback(url);
  if (!json || !json.full_name) return base;
  return {
    ...base,
    title: json.full_name,
    description: json.description || "",
    author: json.owner?.login || null,
    avatar: json.owner?.avatar_url || null,
    image: json.owner?.avatar_url || null,
    repoFullName: json.full_name,
    repoStars: typeof json.stargazers_count === "number" ? json.stargazers_count : null,
    repoForks: typeof json.forks_count === "number" ? json.forks_count : null,
    repoLanguage: json.language || null,
    publishedAt: json.updated_at || null,
  };
}

async function fetchGitHubPreview(url: string): Promise<LinkPreview | null> {
  const parsed = parseGitHubRepo(url);
  if (!parsed) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) return null;
    return parseGitHubRepoJson(await res.json(), url);
  } catch {
    return null;
  }
}

/* ---------------- Commerce (store-detected; eBay JSON-LD parsed) ---------------- */

export function commerceStoreFromUrl(url: string): CommerceStore | null {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    if (host.includes("amazon.")) return "amazon";
    if (host.includes("flipkart.")) return "flipkart";
    if (host.includes("meesho.")) return "meesho";
    if (host.includes("ebay.") || host === "ebay.com") return "ebay";
    if (host.includes("etsy.") || host === "etsy.com") return "etsy";
    if (host.includes("aliexpress.")) return "aliexpress";
    if (host.includes("walmart.") || host === "walmart.com") return "walmart";
    return null;
  } catch {
    return null;
  }
}

function amazonAsinFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.toLowerCase().includes("amazon.")) return null;
    return parsed.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1].toUpperCase() || null;
  } catch {
    return null;
  }
}

function amazonImageFromUrl(url: string): string | null {
  const asin = amazonAsinFromUrl(url);
  return asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg` : null;
}

/** Flag generic OG/markdown results from known stores as commerce. */
export function withCommerce(base: LinkPreview, url: string): LinkPreview {
  const store = commerceStoreFromUrl(url);
  if (!store) return base;
  return {
    ...base,
    isCommerce: true,
    commerceStore: store,
    siteName: base.siteName || store,
    isWalmart: store === "walmart" ? true : base.isWalmart,
  };
}

export function parseEbayId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.toLowerCase().includes("ebay.")) return null;
    const m = u.pathname.match(/\/itm\/(?:[^/]+\/)?(\d{9,15})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function isEbayUrl(url: string): boolean {
  return parseEbayId(url) != null;
}

export function isEtsyUrl(url: string): boolean {
  return hostIs(url, "etsy.com");
}

export function isWalmartUrl(url: string): boolean {
  return hostIs(url, "walmart.com");
}

/** Depth-first search for a JSON-LD node whose @type matches any of `types`. */
function findLdNode(data: unknown, types: string[]): Record<string, unknown> | null {
  const arr = Array.isArray(data) ? data : [data];
  for (const node of arr) {
    if (!node || typeof node !== "object") continue;
    const n = node as Record<string, unknown>;
    const t = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
    if (types.some((ty) => t.includes(ty))) return n;
    if (Array.isArray(n["@graph"])) {
      const found = findLdNode(n["@graph"], types);
      if (found) return found;
    }
  }
  return null;
}

/** Extract the first Product JSON-LD block from item HTML. */
export function parseEbayJsonLd(html: string): {
  name?: string;
  image?: string;
  price?: string;
  wasPrice?: string;
  currency?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  seller?: string;
} | null {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data: unknown;
    try {
      data = JSON.parse(inner);
    } catch {
      continue;
    }
    const found = findProductNode(data);
    if (found) return found;
  }
  return null;
}

function findProductNode(data: unknown): {
  name?: string;
  image?: string;
  price?: string;
  wasPrice?: string;
  currency?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  seller?: string;
} | null {
  const arr = Array.isArray(data) ? data : [data];
  for (const node of arr) {
    if (!node || typeof node !== "object") continue;
    const n = node as Record<string, unknown>;
    const types = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
    if (types.includes("Product") || types.includes("IndividualProduct")) {
      const offers = (Array.isArray(n.offers) ? n.offers[0] : n.offers) as Record<string, unknown> | undefined;
      const agg = n.aggregateRating as Record<string, unknown> | undefined;
      const brand = n.brand as Record<string, unknown> | string | undefined;
      const seller = (offers?.seller || offers?.offeredBy) as Record<string, unknown> | undefined;
      const img = Array.isArray(n.image) ? n.image[0] : n.image;
      const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v !== "" ? Number(v) : undefined);
      let wasPrice: string | undefined;
      const specs = offers?.priceSpecification as Record<string, unknown> | undefined;
      if (specs && (specs.minPrice != null || specs.maxPrice != null)) {
        const lo = typeof offers?.price === "string" || typeof offers?.price === "number" ? Number(offers.price) : null;
        const candidates = [specs.minPrice, specs.maxPrice].map(Number);
        const other = candidates.find((c) => lo == null || !Number.isNaN(c) && Math.abs(c - lo) > 0.01);
        if (other != null && !Number.isNaN(other) && other > (lo ?? 0)) wasPrice = String(other);
      }
      if (!wasPrice && Array.isArray(n.additionalProperty)) {
        for (const prop of n.additionalProperty as unknown[]) {
          const p = firstObj(prop);
          if (p && /original|was|list/i.test(String(p.name ?? "")) && p.value != null) {
            wasPrice = String(p.value);
            break;
          }
        }
      }
      return {
        name: typeof n.name === "string" ? n.name : undefined,
        image: typeof img === "string" ? img : undefined,
        price: offers && (offers.price ?? offers.lowPrice) != null ? String(offers.price ?? offers.lowPrice) : undefined,
        wasPrice,
        currency: typeof offers?.priceCurrency === "string" ? (offers.priceCurrency as string) : undefined,
        brand: typeof brand === "string" ? brand : typeof brand?.name === "string" ? (brand.name as string) : undefined,
        rating: num(agg?.ratingValue) ?? undefined,
        reviews: num(agg?.reviewCount) ?? undefined,
        seller: typeof seller?.name === "string" ? (seller.name as string) : undefined,
      };
    }
    if (Array.isArray(n["@graph"])) {
      const found = findProductNode(n["@graph"]);
      if (found) return found;
    }
  }
  return null;
}

/** Strip tags + collapse whitespace from an HTML fragment. */
function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function firstGroup(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m && m[1] ? stripTags(m[1]) || null : null;
}

/* ----- Amazon (stable selectors; hard-blocked pages return null) ----- */

const AMAZON_BLOCK_RE = /captcha|robot check|enter the characters you see below|dogs of amazon/i;

export function parseAmazonHtml(html: string, url: string): LinkPreview | null {
  if (AMAZON_BLOCK_RE.test(html)) return null;
  const title = firstGroup(html, /<span[^>]+id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!title) return null; // 200-OK silent block: no title, no data

  const og = parseOpenGraph(html, url);
  // First .a-offscreen in DOM order = buybox price.
  const offscreens = [...html.matchAll(/class="[^"]*a-offscreen[^"]*"[^>]*>([^<]+)</gi)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean);
  const struck = firstGroup(
    html,
    /class="[^"]*a-text-price[^"]*"[^>]*>[\s\S]*?class="[^"]*a-offscreen[^"]*"[^>]*>([^<]+)</i,
  );
  const ratingTxt = firstGroup(html, /data-hook="rating-out-of-text"[^>]*>([^<]+)</i);
  const reviewsTxt = firstGroup(html, /id="acrCustomerReviewText"[^>]*>([^<]+)</i);
  const byline = firstGroup(html, /id="bylineInfo"[^>]*>([\s\S]*?)<\/(?:span|a|div)>/i);
  const hires = html.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/i)?.[1] || null;

  let seller: string | null = null;
  if (byline) {
    seller = byline
      .replace(/^visit the\s+/i, "")
      .replace(/\s+store$/i, "")
      .replace(/^brand:\s*/i, "")
      .trim() || null;
  }

  return {
    ...og,
    siteName: "Amazon",
    title,
    image: hires || og.image,
    author: seller || og.author,
    isCommerce: true,
    commerceStore: "amazon",
    commercePrice: offscreens[0] || null,
    commerceMrp: struck && struck !== offscreens[0] ? struck : null,
    commerceRating: ratingTxt ? Number.parseFloat(ratingTxt) || null : null,
    commerceReviews: reviewsTxt ? Number(reviewsTxt.replace(/[^0-9]/g, "")) || null : null,
    commerceSeller: seller,
  };
}

/* ----- Flipkart (class-based selectors; they rotate, so all optional) ----- */

export function parseFlipkartHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  const title =
    firstGroup(html, /<span[^>]*class="[^"]*B_NuCI[^"]*"[^>]*>([^<]+)</i) ||
    firstGroup(html, /<h1[^>]*class="[^"]*_9E25nV[^"]*"[^>]*>([^<]+)</i);
  if (!title && !og.title) return null;

  const price = firstGroup(html, /class="[^"]*(?:_30jeq3|_25b18c)[^"]*"[^>]*>([^<]*₹[^<]*)</i);
  const mrp = firstGroup(html, /class="[^"]*_3I9_wc[^"]*"[^>]*>([^<]+)</i);
  const ratingTxt = firstGroup(html, /class="[^"]*_3LWZlK[^"]*"[^>]*>([\d.]+)</i);
  const ratingCountTxt = firstGroup(html, /class="[^"]*_2_R_DZ[^"]*"[^>]*>([^<]+)</i);
  // "45,678 Ratings & 3,210 Reviews" → ratings figure only (first number).
  const ratingsNum = ratingCountTxt
    ? (ratingCountTxt.match(/([\d,]+)\s*ratings?/i)?.[1] || ratingCountTxt.match(/[\d,]+/)?.[0] || "")
    : "";
  const seller =
    firstGroup(html, /class="[^"]*_1RLviY[^"]*"[^>]*>([^<]+)</i) ||
    firstGroup(html, /class="[^"]*_3enH42[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const highlights = [...html.matchAll(/<li[^>]*class="[^"]*_21Ahn-[^"]*"[^>]*>([^<]+)</gi)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean)
    .join("; ")
    .slice(0, 300);

  return {
    ...og,
    siteName: "Flipkart",
    title: title || og.title,
    description: highlights || og.description,
    author: seller || og.author,
    isCommerce: true,
    commerceStore: "flipkart",
    commercePrice: price,
    commerceMrp: mrp && mrp !== price ? mrp : null,
    commerceRating: ratingTxt ? Number.parseFloat(ratingTxt) || null : null,
    commerceReviews: ratingsNum ? Number(ratingsNum.replace(/[^0-9]/g, "")) || null : null,
    commerceSeller: seller,
  };
}

/* ----- Meesho (OG + Product JSON-LD + price meta, all best-effort) ----- */

export function parseMeeshoHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title && !html.includes("meesho")) return null;
  const ld = parseEbayJsonLd(html); // generic Product-block finder, not eBay-specific
  const priceMeta =
    html.match(/<meta[^>]+property="(?:product:price:amount|og:price:amount)"[^>]+content="([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="(?:product:price:amount|og:price:amount)"/i)?.[1] ||
    null;
  const currMeta =
    html.match(/<meta[^>]+property="(?:product:price:currency|og:price:currency)"[^>]+content="([^"]+)"/i)?.[1] || null;
  const avgRating = html.match(/"average_rating"\s*:\s*([\d.]+)/)?.[1];
  const ratingCount = html.match(/"rating_count"\s*:\s*(\d+)/)?.[1];

  const price = ld?.price
    ? ld.currency
      ? `${ld.currency} ${ld.price}`
      : ld.price
    : priceMeta
      ? currMeta
        ? `${currMeta} ${priceMeta}`
        : priceMeta
      : null;

  return {
    ...og,
    siteName: "Meesho",
    title: ld?.name || og.title,
    image: ld?.image || og.image,
    author: ld?.seller || ld?.brand || og.author,
    isCommerce: true,
    commerceStore: "meesho",
    commercePrice: price,
    commerceMrp: null,
    commerceRating: ld?.rating ?? (avgRating ? Number(avgRating) || null : null),
    commerceReviews: ld?.reviews ?? (ratingCount ? Number(ratingCount) : null),
    commerceSeller: ld?.seller || null,
  };
}

/** Fetch + parse a marketplace PDP. Null = blocked/unparseable → caller falls through. */
async function fetchMarketplacePreview(
  url: string,
  store: CommerceStore,
): Promise<LinkPreview | null> {
  if (store === "ebay" || store === "etsy" || store === "walmart") return null;
  if (store !== "amazon" && store !== "flipkart" && store !== "meesho" && store !== "aliexpress") return null;
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || !html.includes("<")) return null;
    if (store === "amazon") return parseAmazonHtml(html, url);
    if (store === "flipkart") return parseFlipkartHtml(html, url);
    if (store === "aliexpress") return parseAliexpressHtml(html, url);
    return parseMeeshoHtml(html, url);
  } catch {
    return null; // CORS / network — generic chain + manual fields take over
  }
}

/** AliExpress SSR embeds the price as JSON strings; OG tags carry the rest. */
export function parseAliexpressHtml(html: string, url: string): LinkPreview | null {
  if (!html.includes("<")) return null;
  const og = parseOpenGraph(html, url);
  const price =
    html.match(/"formattedAmount":"?([^",}]+)"?/)?.[1] ||
    html.match(/"salePrice"?:\s*"?([\d.,]+)"?/)?.[1] ||
    html.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([\d.,]+)["']/i)?.[1] ||
    null;
  const currency =
    html.match(/<meta[^>]+property=["']og:price:currency["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/"currency":"([A-Z]{3})"/)?.[1] ||
    null;
  const rating = parseFloat(html.match(/"avgRating"?:\s*"?([\d.]+)"?/)?.[1] || "");
  const reviews = parseInt(html.match(/"tradeCount"?:\s*"?(\d+)"?/)?.[1] || html.match(/"orderQuantity"?:\s*"?(\d+)"?/)?.[1] || "", 10);
  return {
    ...og,
    siteName: "AliExpress",
    isCommerce: true,
    commerceStore: "aliexpress",
    commercePrice: price ? `${currency ? `${currency} ` : ""}${price}` : null,
    commerceRating: Number.isFinite(rating) ? rating : null,
    commerceReviews: Number.isFinite(reviews) && reviews > 0 ? reviews : null,
  };
}

async function fetchEbayPreview(url: string): Promise<LinkPreview | null> {  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || !html.includes("<")) return null;
    const og = parseOpenGraph(html, url);
    const ld = parseEbayJsonLd(html);
    const base: LinkPreview = {
      ...og,
      siteName: "eBay",
      isCommerce: true,
      commerceStore: "ebay",
    };
    if (!ld) return base;
    return {
      ...base,
      title: ld.name || base.title,
      image: ld.image || base.image,
      author: ld.seller || ld.brand || base.author,
      commercePrice: ld.price ? (ld.currency ? `${ld.currency} ${ld.price}` : ld.price) : null,
      commerceMrp: ld.wasPrice ? (ld.currency ? `${ld.currency} ${ld.wasPrice}` : ld.wasPrice) : null,
      commerceRating: ld.rating ?? null,
      commerceReviews: ld.reviews ?? null,
      commerceSeller: ld.seller || null,
      commerceCondition: conditionOf(html) || null,
      commerceSold: soldTextOf(html),
      sellerFeedbackPercent: feedbackPctOf(html),
      commerceSellerFeedback: sellerFeedbackOf(html),
    };
  } catch {
    return null;
  }
}

/** eBay DOM is often rendered server-side below the fold; these are all best-effort. */
function conditionOf(html: string): string | null {
  const m =
    html.match(/"itemCondition"\s*:\s*"?([^",}]+)"?/i)?.[1] ||
    html.match(/"conditionDisplayName"\s*:\s*"([^"]+)"/i)?.[1] ||
    html.match(/<span[^>]*itemprop="itemCondition"[^>]*>([^<]+)<\/span>/i)?.[1] ||
    null;
  return m ? stripTags(m) : null;
}

function soldTextOf(html: string): string | null {
  const m =
    html.match(/(\d[\d,]*)\s+sold/i)?.[1] ||
    html.match(/"soldCount"\s*:\s*"?(\d+)"?/i)?.[1] ||
    null;
  return m ? `${m} sold` : null;
}

function feedbackPctOf(html: string): number | null {
  const m =
    html.match(/([\d.]+)%\s*positive/i)?.[1] ||
    html.match(/"positiveFeedbackPercent"\s*:\s*([\d.]+)/)?.[1] ||
    null;
  return m ? Number.parseFloat(m) || null : null;
}

function sellerFeedbackOf(html: string): string | null {
  const m =
    html.match(/\(([\d,]{2,})\)\s*[\d.]+%/i)?.[1] ||
    html.match(/\bseller\s*\(([\d,]{2,})\)/i)?.[1] ||
    html.match(/"feedbackScore"\s*:\s*([\d,]+)/)?.[1] ||
    null;
  return m ? `(${m})` : null;
}

/* ----- Etsy (OG + Product JSON-LD + price meta) ----- */

export function parseEtsyHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title && !html.includes("etsy")) return null;
  const ld = parseEbayJsonLd(html); // generic Product-block finder, not eBay-specific
  const priceMeta =
    html.match(/<meta[^>]+property="(?:product:price:amount|og:price:amount)"[^>]+content="([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="(?:product:price:amount|og:price:amount)"/i)?.[1] ||
    null;
  const currMeta =
    html.match(/<meta[^>]+property="(?:product:price:currency|og:price:currency)"[^>]+content="([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="(?:product:price:currency|og:price:currency)"/i)?.[1] ||
    null;
  const shop =
    html.match(/<a[^>]*href="[^"]*\/shop\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)?.[2] ||
    html.match(/"shopName"\s*:\s*"([^"]+)"/i)?.[1] ||
    null;
  const sellerName =
    html.match(/"bySellerName"\s*:\s*"([^"]+)"/i)?.[1] ||
    html.match(/<a[^>]*class="[^"]*shop-name[^"]*"[^>]*>([^<]+)<\/a>/i)?.[1] ||
    (shop ? String(shop) : null);
  const price = ld?.price || priceMeta;
  const ratingTxt = html.match(/"rating"\s*:\s*([\d.]+)/)?.[1];
  const reviewsTxt = html.match(/"ratingsCount"\s*:\s*(\d+)/)?.[1] || html.match(/"reviewCount"\s*:\s*(\d+)/)?.[1];

  return {
    ...og,
    siteName: "Etsy",
    title: ld?.name || og.title,
    image: ld?.image || og.image,
    author: sellerName || ld?.seller || og.author,
    isCommerce: true,
    commerceStore: "etsy",
    commercePrice: price ? (currMeta || ld?.currency ? `${currMeta || ld?.currency} ${price}` : price) : null,
    commerceRating: ld?.rating ?? (ratingTxt ? Number.parseFloat(ratingTxt) || null : null),
    commerceReviews: ld?.reviews ?? (reviewsTxt ? Number(reviewsTxt) || null : null),
    commerceSeller: sellerName || ld?.seller || null,
    commerceSold: html.match(/([\d,]+)\s+(?:sales)/i)?.[1]
      ? `${html.match(/([\d,]+)\s+(?:sales)/i)?.[1]} sold`
      : null,
  };
}

/* ----- Walmart (bot-blocked; best-effort only, og + embedded state) ----- */

export function parseWalmartHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title && !html.toLowerCase().includes("walmart")) return null;
  const price =
    html.match(/"currentPrice"\s*:\s*"?([\d.]+)"?/i)?.[1] ||
    html.match(/"price"\s*:\s*"?([\d.]+)"?/i)?.[1] ||
    null;
  const currency = html.match(/"currencyCode"\s*:\s*"([A-Z]{3})"/i)?.[1] || "USD";
  const rating = html.match(/"averageRating"\s*:\s*([\d.]+)/i)?.[1];
  const reviews = html.match(/"ratingCount"\s*:\s*(\d+)/i)?.[1] || html.match(/"reviewCount"\s*:\s*(\d+)/i)?.[1];
  return {
    ...og,
    siteName: "Walmart",
    isCommerce: true,
    isWalmart: true,
    commerceStore: "walmart",
    commercePrice: price ? (currency === "USD" ? `$${price}` : `${currency} ${price}`) : null,
    commerceRating: rating ? Number.parseFloat(rating) || null : null,
    commerceReviews: reviews ? Number.parseInt(reviews, 10) || null : null,
  };
}

/** Fetch + parse a bespoke commerce page (eBay/Etsy/Walmart share no generic path). */
async function fetchBespokeCommercePreview(
  url: string,
  store: CommerceStore,
): Promise<LinkPreview | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || !html.includes("<")) return null;
    if (store === "ebay") return fetchEbayPreview(url);
    if (store === "etsy") return parseEtsyHtml(html, url);
    if (store === "walmart") return parseWalmartHtml(html, url);
    return null;
  } catch {
    return null;
  }
}

/* ---------------- Shared helpers for product-style platforms ---------------- */

function cleanText(s: string): string {
  return decodeEntities(s).replace(/\s+/g, " ").trim();
}

function numOr(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? parseFloat(value) : NaN;
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
}

/** Unwrap an object that JSON-LD authors often emit as a single-item array. */
function firstObj(v: unknown): Record<string, unknown> | null {
  if (Array.isArray(v)) return v.length && typeof v[0] === "object" && v[0] ? (v[0] as Record<string, unknown>) : null;
  if (v && typeof v === "object") return v as Record<string, unknown>;
  return null;
}

function digPath(root: unknown, path: string[]): unknown {
  let cur = root;
  for (const key of path) {
    if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[key];
    else return undefined;
  }
  return cur;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
  RUB: "₽",
  BRL: "R$",
};

/** Fetch OG tags directly, else route through the r.jina.ai markdown reader. Never throws. */
async function fetchOgWithFallback(url: string, siteName: string): Promise<LinkPreview | null> {
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    // fall through to the proxy
  }
  if (html) {
    const og = parseOpenGraph(html, url);
    return { ...og, siteName: og.siteName || siteName };
  }
  try {
    const res = await fetch(`https://r.jina.ai/${url}`);
    if (!res.ok) return null;
    const md = await res.text();
    if (!md || !md.trim()) return null;
    const parsed = parseMarkdown(md, url);
    return { ...parsed, siteName: parsed.siteName || siteName };
  } catch {
    return null;
  }
}

/** Skeleton LinkPreview for a brand; platform flags come from the caller. */
function blankFallback(url: string, siteName: string): LinkPreview {
  return {
    url,
    title: "",
    description: "",
    image: null,
    siteName,
    author: null,
    readingMinutes: null,
    publishedAt: null,
    isTweet: false,
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: false,
    youtubeKind: null,
    youtubeId: null,
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
  };
}

/* ---------------- Generic OG-backed brand platform ---------------- */

/** Best-effort OG fetch for brand platforms, stamped with the given flags. */
async function fetchBrandPreview(
  url: string,
  siteName: string,
  flags: Partial<LinkPreview>,
): Promise<LinkPreview | null> {
  const og = await fetchOgWithFallback(url, siteName);
  if (!og) return null;
  return { ...og, siteName: og.siteName || siteName, ...flags };
}

/** Flag-marked skeleton so the UI still auto-switches when fetch fails. */
function brandFallback(url: string, siteName: string, flags: Partial<LinkPreview>): LinkPreview {
  return { ...blankFallback(url, siteName), ...flags };
}

/** True when the hostname matches a brand root or any of its subdomains. */
function hostIs(url: string, ...roots: string[]): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return roots.some((root) => host === root || host.endsWith("." + root));
  } catch {
    return false;
  }
}

/* ---------------- LinkedIn (post — OG / manual) ---------------- */

export function isLinkedInUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

/** LinkedIn long-form articles live under /pulse/ (vs /posts/ feed posts). */
export function isLinkedInArticleUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    if (!(host === "linkedin.com" || host.endsWith(".linkedin.com"))) return false;
    return /\/pulse\//i.test(u.pathname);
  } catch {
    return false;
  }
}

/** Strip the "Author on LinkedIn: …" og:title prefix. */
export function cleanLinkedInText(text: string): string {
  const cleaned = text.trim();
  const m = cleaned.match(/^(.*?)\s+on\s+LinkedIn\s*:\s*([\s\S]*)$/i);
  return m ? (m[2].trim() || m[1].trim()) : cleaned;
}

/** Extract Article JSON-LD stats for a LinkedIn Pulse article. */
export function parseLinkedInArticleJsonLd(html: string): {
  headline?: string;
  author?: string;
  datePublished?: string;
  likeCount?: number;
  commentCount?: number;
  image?: string;
} | null {
  const node = findLdNode(getJsonLdNodes(html), ["Article", "NewsArticle"]);
  if (!node) return null;
  const str = (v: unknown): string | null => {
    const t = typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : null;
    return t ? cleanText(t) || null : null;
  };
  const authorField = node.author;
  const author = typeof authorField === "string"
    ? cleanText(authorField)
    : firstObj(authorField)?.name
      ? String(firstObj(authorField)?.name)
      : null;
  let likeCount: number | null = null;
  let commentCount: number | null = null;
  if (Array.isArray(node.interactionStatistic)) {
    for (const stat of node.interactionStatistic as unknown[]) {
      const s = firstObj(stat);
      if (!s) continue;
      const type = Array.isArray(s["@type"]) ? s["@type"][0] : s["@type"];
      const count = numOr(s.userInteractionCount);
      if (type === "LikeAction" && count != null) likeCount = count;
      if (type === "CommentAction" && count != null) commentCount = count;
    }
  }
  commentCount = commentCount ?? numOr(node.commentCount);

  const img = typeof node.image === "string" ? node.image : Array.isArray(node.image) ? String(node.image[0] ?? "") : null;
  return {
    headline: str(node.headline) || undefined,
    author: author || undefined,
    datePublished: str(node.datePublished) || undefined,
    likeCount: likeCount ?? undefined,
    commentCount: commentCount ?? undefined,
    image: img || undefined,
  };
}

async function fetchLinkedInPreview(url: string): Promise<LinkPreview | null> {
  const og = await fetchOgWithFallback(url, "LinkedIn");
  if (!og) return null;
  const title = cleanLinkedInText(og.title || og.author || og.description || "");
  const base: LinkPreview = {
    ...og,
    siteName: "LinkedIn",
    isLinkedIn: true,
    headline: title || null,
  };
  if (!isLinkedInArticleUrl(url)) return base;
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    // og-only fallback below
  }
  const ld = html ? parseLinkedInArticleJsonLd(html) : null;
  return {
    ...base,
    isLinkedInArticle: true,
    headline: ld?.headline || base.headline,
    author: ld?.author || og.author,
    publishedAt: ld?.datePublished || og.publishedAt,
    likeCount: ld?.likeCount ?? og.likeCount ?? null,
    replyCount: ld?.commentCount ?? og.replyCount ?? null,
    image: ld?.image || og.image,
  };
}

function linkedInFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "LinkedIn"), isLinkedIn: true };
}

/* ---------------- Blogs & long-form platforms ---------------- */

export function isBlogspotUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return /(^|\.)blogspot\.[a-z.]+$/.test(host) || host.endsWith("blogger.com");
  } catch {
    return false;
  }
}

export function isDevToUrl(url: string): boolean {
  return hostIs(url, "dev.to", "devcommunity.net");
}

export function isSubstackUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    if (!(host === "substack.com" || host.endsWith(".substack.com"))) return false;
    if (/^www\.substack\.com$/i.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export function isWordPressUrl(url: string): boolean {
  return hostIs(url, "wordpress.com");
}

export function isHashnodeUrl(url: string): boolean {
  return hostIs(url, "hashnode.dev", "hashnode.com");
}

/** X long-form article URLs live under /i/article/ (the /i/status/ wrapper is detected by sniffing). */
export function isXArticleUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (!(host === "twitter.com" || host === "x.com")) return false;
    return /\/i\/article\//i.test(u.pathname);
  } catch {
    return false;
  }
}

/** HEURISTIC: an /i/status/ page renders as an article when the SSR JSON carries
 *  both an "Article"-typed entry and a "views" field (tweets have no views prop). */
export function detectXArticle(html: string): boolean {
  if (/\/i\/article\//i.test(html.slice(0, 600))) return true;
  return /"Article"\s*:\s*\{/.test(html) && /"views"\s*:\s*"/.test(html);
}

/** Build an X "article" preview from a fetched page + its OG data. */
function buildXArticlePreview(url: string, html: string | null, og: LinkPreview | null): LinkPreview {
  let author = og?.author || null;
  let handle = og?.handle || null;
  let title = og?.title || "";
  if (og?.title) {
    const m = og.title.match(/^(.+?)\s*\(@([\w]+)\)\s*on\s*X$/i);
    if (m) {
      author = m[1].trim();
      handle = m[2];
      title = og.description || og.title;
    }
  }
  return {
    ...(og || blankFallback(url, "X")),
    siteName: "X",
    title: title || og?.description || "",
    description: og?.description || "",
    author,
    handle,
    image: og?.image || null,
    isTweet: true,
    isXArticle: true,
  };
}

/** For X articles (x.com/i/article or a sniffed /i/status/). Null when not an article. */
export async function fetchXArticlePreview(url: string): Promise<LinkPreview | null> {
  if (!isXArticleUrl(url)) return null;
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    html = null;
  }
  const og = await fetchOgWithFallback(url, "X");
  if (!html && !og) return null;
  if (html && !detectXArticle(html) && !isXArticleUrl(url)) return null;
  return buildXArticlePreview(url, html, og);
}

/** Ambiguous /i/status/ link: sniff the SSR payload to tell article from tweet. */
export async function sniffXArticle(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || !html.includes("<") || !detectXArticle(html)) return null;
    const og = await fetchOgWithFallback(url, "X");
    return buildXArticlePreview(url, html, og);
  } catch {
    return null;
  }
}

/** Extract "N min read" as a number (matching several SSR/DOM spellings). */
function minReadOf(html: string): number | null {
  const m =
    html.match(/(\d{1,3})\s*min(?:ute)?\s*read/i)?.[1] ||
    html.match(/"readingTime"\s*:\s*"?(\d+)"?/i)?.[1] ||
    html.match(/"reading_time"\s*:\s*"?(\d+)"?/i)?.[1] ||
    html.match(/"readTime"\s*:\s*"?(\d+)"?/i)?.[1] ||
    html.match(/"read_time"\s*:\s*"?(\d+)"?/i)?.[1] ||
    null;
  const n = m ? Number.parseInt(m, 10) : NaN;
  return Number.isFinite(n) && n > 0 && n < 240 ? n : null;
}

function metaTagContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  return html.match(re)?.[1] ? stripTags(html.match(re)?.[1] || "") || null : null;
}

function tagLinksOf(html: string): string[] {
  const found = [
    ...html.matchAll(/<a[^>]+rel=["'][^"']*\btag\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi),
    ...html.matchAll(/<meta[^>]+property=["']article:tag["'][^>]+content=["']([^"']+)["']/gi),
  ]
    .map((m) => stripTags(m[1]))
    .filter(Boolean);
  return Array.from(new Set(found)).slice(0, 6);
}

export function parseSubstackHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title && !html.includes("substack")) return null;
  let publication = og.siteName || null;
  if (!publication) {
    publication =
      html.match(/"newsletter"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i)?.[1] ||
      html.match(/<meta[^>]+name=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      null;
  }
  if (!publication) {
    try {
      const host = new URL(url.trim()).hostname;
      const label = host.split(".")[0];
      publication = label && label !== "www" && label !== "open" ? label.charAt(0).toUpperCase() + label.slice(1) : null;
    } catch {
      publication = null;
    }
  }
  const author =
    metaTagContent(html, "author") ||
    html.match(/"author_name"\s*:\s*"([^"]+)"/i)?.[1] ||
    og.author ||
    null;
  const likes = parseInt(html.match(/,?["']like_count["']\s*:\s*(\d+)/i)?.[1] || html.match(/"likeCount"\s*:\s*(\d+)/i)?.[1] || "", 10);
  const comments = parseInt(html.match(/"comment_count"\s*:\s*(\d+)/i)?.[1] || html.match(/"commentCount"\s*:\s*(\d+)/i)?.[1] || "", 10);
  const tagsMatch = html.match(/"postTags"\s*:\s*\[([\s\S]*?)\]/i)?.[1];
  const tags = tagsMatch
    ? Array.from(tagsMatch.matchAll(/"name"\s*:\s*"([^"]+)"/gi)).map((m) => m[1]).slice(0, 6)
    : null;
  return {
    ...og,
    siteName: publication || "Substack",
    author,
    publishedAt: og.publishedAt || metaTagContent(html, "article:published_time") || null,
    readingMinutes: minReadOf(html),
    likeCount: Number.isFinite(likes) && likes > 0 ? likes : null,
    commentCount: Number.isFinite(comments) && comments > 0 ? comments : null,
    tags: tags?.length ? tags : null,
    isSubstack: true,
  };
}

export function parseHashnodeHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title && !html.includes("hashnode")) return null;
  const author =
    html.match(/"author"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    og.author ||
    null;
  const reactions = parseInt(html.match(/"totalReactions"\s*:\s*(\d+)/i)?.[1] || html.match(/"likeCount"\s*:\s*(\d+)/i)?.[1] || "", 10);
  const comments = parseInt(html.match(/"responseCount"\s*:\s*(\d+)/i)?.[1] || html.match(/"commentCount"\s*:\s*(\d+)/i)?.[1] || "", 10);
  const tagsMatch = html.match(/"tags"\s*:\s*\[([\s\S]*?)\]/i)?.[1];
  const tags = tagsMatch
    ? Array.from(tagsMatch.matchAll(/"name"\s*:\s*"([^"]+)"/gi)).map((m) => m[1]).slice(0, 6)
    : null;
  return {
    ...og,
    siteName: og.siteName || "Hashnode",
    author,
    publishedAt: og.publishedAt || metaTagContent(html, "article:published_time") || null,
    readingMinutes: minReadOf(html),
    likeCount: Number.isFinite(reactions) && reactions > 0 ? reactions : null,
    commentCount: Number.isFinite(comments) && comments > 0 ? comments : null,
    tags: tags?.length ? tags : null,
    isHashnode: true,
  };
}

export function parseWordPressHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title) return null;
  const author =
    html.match(/<a[^>]+rel=["']author["'][^>]*>([\s\S]*?)<\/a>/i)?.[1] ||
    metaTagContent(html, "author") ||
    og.author ||
    null;
  const comments = parseInt(html.match(/"comment_count"\s*:\s*"?(\d+)"?/i)?.[1] || "", 10);
  const publishedAt = og.publishedAt || metaTagContent(html, "article:published_time") || null;
  return {
    ...og,
    siteName: og.siteName || "WordPress",
    author,
    publishedAt,
    readingMinutes: minReadOf(html),
    commentCount: Number.isFinite(comments) && comments > 0 ? comments : null,
    tags: tagLinksOf(html) || null,
    isWordPress: true,
  };
}

export function parseDevToHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title) return null;
  const author =
    html.match(/"name"\s*:\s*"([^"]+)",[\s\S]*?"@type"\s*:\s*"Person"/i)?.[1] ||
    metaTagContent(html, "author") ||
    og.author ||
    null;
  const publishedAt = og.publishedAt || metaTagContent(html, "article:published_time") || null;
  const tags = Array.from(
    html.matchAll(/<meta[^>]+property=["']article:tag["'][^>]+content=["']([^"']+)["']/gi),
  )
    .map((m) => m[1])
    .filter(Boolean);
  return {
    ...og,
    siteName: og.siteName || "DEV Community",
    author,
    publishedAt,
    readingMinutes: minReadOf(html),
    tags: tags.length ? tags.slice(0, 6) : null,
    isDevTo: true,
  };
}

export function parseBloggerHtml(html: string, url: string): LinkPreview | null {
  const og = parseOpenGraph(html, url);
  if (!og.title) return null;
  const author =
    html.match(/<span[^>]+class=["'][^"']*\bfn\b[^"']*["'][^>]*>([^<]+)</i)?.[1] ||
    html.match(/<a[^>]+rel=["']author["'][^>]*>([^<]+)</i)?.[1] ||
    metaTagContent(html, "author") ||
    og.author ||
    null;
  const tagline = metaTagContent(html, "description");
  const publishedAt = og.publishedAt || metaTagContent(html, "article:published_time") || null;
  return {
    ...og,
    siteName: og.siteName || tagline || "Blogger",
    author: author ? cleanText(author) : null,
    publishedAt,
    readingMinutes: minReadOf(html),
    tags: tagLinksOf(html) || null,
    isBlogspot: true,
  };
}

/* ---------------- Indeed (JobPosting JSON-LD) ---------------- */

export function isIndeedUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host.includes("indeed.com");
  } catch {
    return false;
  }
}

function jobSalaryLabel(base: Record<string, unknown>, str: (v: unknown) => string | null): string | null {
  const value = firstObj(base.value) || {};
  const min = numOr(value.minValue);
  const max = numOr(value.maxValue);
  const currency = str(base.currency);
  const unit = (str(base.unitText) || "").toLowerCase();
  const suffix = unit === "hour" ? "/hr" : unit === "year" ? "/yr" : unit === "month" ? "/mo" : "";
  if (min == null && max == null) return null;
  const fmt = (n: number | null) => {
    if (n == null) return null;
    return currency ? `${currency} ${Math.round(n)}` : String(Math.round(n));
  };
  const lo = fmt(min);
  const hi = fmt(max);
  const label = lo && hi ? `${lo}–${hi}` : lo || hi || "";
  return label ? `${label}${suffix}` : null;
}

export function parseIndeedJobJsonLd(html: string): {
  title?: string;
  company?: string;
  salary?: string;
  jobType?: string;
  location?: string;
  image?: string;
  datePosted?: string;
} | null {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data: unknown;
    try {
      data = JSON.parse(inner);
    } catch {
      continue;
    }
    const node = findLdNode(data, ["JobPosting"]);
    if (!node) continue;
    const str = (v: unknown): string | null => {
      const t = typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : null;
      return t ? cleanText(t) || null : null;
    };
    const locNode = firstObj(node.jobLocation) || {};
    const city = str(digPath(locNode, ["address", "addressLocality"]));
    const region = str(digPath(locNode, ["address", "addressRegion"]));
    const img = typeof node.image === "string" ? node.image : Array.isArray(node.image) ? String(node.image[0] ?? "") : null;
    return {
      title: str(node.title) || undefined,
      company: str(digPath(node, ["hiringOrganization", "name"])) || undefined,
      salary: jobSalaryLabel(firstObj(node.baseSalary) || {}, str) || undefined,
      jobType: str(node.employmentType) || undefined,
      location: [city, region].filter(Boolean).join(", ") || undefined,
      image: img || undefined,
      datePosted: str(node.datePosted) || undefined,
    };
  }
  return null;
}

async function fetchIndeedPreview(url: string): Promise<LinkPreview | null> {
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    return null;
  }
  if (!html) return null;
  const og = parseOpenGraph(html, url);
  const ld = parseIndeedJobJsonLd(html);
  return {
    ...og,
    siteName: "Indeed",
    isIndeed: true,
    title: ld?.title || og.title,
    author: ld?.company || og.author,
    image: ld?.image || og.image,
    salary: ld?.salary || null,
    jobType: ld?.jobType || null,
    jobLocation: ld?.location || null,
    publishedAt: ld?.datePosted || og.publishedAt,
  };
}

function indeedFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "Indeed"), isIndeed: true };
}

/* ---------------- Zomato / Swiggy (restaurant — OG + Restaurant JSON-LD) ---------------- */

export function isZomatoUrl(url: string): boolean {
  try {
    return new URL(url.trim()).hostname.toLowerCase().includes("zomato.");
  } catch {
    return false;
  }
}

export function isSwiggyUrl(url: string): boolean {
  try {
    return new URL(url.trim()).hostname.toLowerCase().includes("swiggy.");
  } catch {
    return false;
  }
}

export function parseRestaurantJsonLd(html: string): {
  name?: string;
  image?: string;
  cuisine?: string;
  locality?: string;
  rating?: number;
  reviews?: number;
  price?: string;
} | null {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data: unknown;
    try {
      data = JSON.parse(inner);
    } catch {
      continue;
    }
    const node = findLdNode(data, ["Restaurant"]);
    if (!node) continue;
    const str = (v: unknown): string | null => {
      if (typeof v === "string" && v.trim()) return cleanText(v);
      if (Array.isArray(v)) return v.filter((x) => typeof x === "string").map((x) => cleanText(String(x))).join(", ") || null;
      return null;
    };
    const agg = firstObj(node.aggregateRating) || {};
    const img = typeof node.image === "string" ? node.image : Array.isArray(node.image) ? String(node.image[0] ?? "") : null;
    const priceRaw = str(node.priceRange);
    return {
      name: str(node.name) || undefined,
      image: img || undefined,
      cuisine: str(node.servesCuisine) || undefined,
      locality: str(digPath(node, ["address", "addressLocality"])) || undefined,
      rating: numOr(agg.ratingValue) ?? undefined,
      reviews: numOr(agg.reviewCount) ?? undefined,
      price: priceRaw ? `₹${priceRaw.replace(/[^\d.,]/g, "")}` : undefined,
    };
  }
  return null;
}

/** "North Indian, Chinese • ₹600 for two" → { cuisine, price }. */
function parseZomatoDescription(desc: string): { cuisine: string | null; price: string | null } {
  const d = cleanText(desc);
  const priceMatch = d.match(/₹\s*([\d,]+)/i);
  const cuisine = d.split("•")[0]?.replace(/₹.*$/, "").trim() || null;
  return {
    cuisine: cuisine || null,
    price: priceMatch ? `₹${priceMatch[1].replace(/,/g, "")}` : null,
  };
}

async function fetchRestaurantPreview(url: string, brand: "Zomato" | "Swiggy"): Promise<LinkPreview | null> {
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    // fall through to the proxy
  }

  if (html) {
    const og = parseOpenGraph(html, url);
    const base = { ...og, siteName: brand, isZomato: brand === "Zomato", isSwiggy: brand === "Swiggy" };
    const ld = parseRestaurantJsonLd(html);
    if (ld) {
      return {
        ...base,
        cuisine: ld.cuisine || base.cuisine,
        area: ld.locality || base.area,
        commercePrice: ld.price || base.commercePrice,
        commerceRating: ld.rating ?? base.commerceRating,
        commerceReviews: ld.reviews ?? base.commerceReviews,
      };
    }
    const z = brand === "Zomato" ? parseZomatoDescription(base.description || "") : { cuisine: null, price: null };
    const etaMatch =
      html.match(/[^\d](\d{1,2})\s*[–-]\s*(\d{1,2})\s*min/i) ||
      html.match(/[^\d](\d{1,2})\s*mins?\b/i);
    return {
      ...base,
      cuisine: z.cuisine || base.cuisine,
      commercePrice: z.price || base.commercePrice,
      eta: etaMatch ? `${etaMatch[1]}${etaMatch[2] ? `–${etaMatch[2]}` : ""} min` : null,
    };
  }

  try {
    const res = await fetch(`https://r.jina.ai/${url}`);
    if (!res.ok) return null;
    const md = await res.text();
    if (!md || !md.trim()) return null;
    const parsed = parseMarkdown(md, url);
    const lines = md.split("\n").map((l) => cleanText(l)).filter(Boolean);
    const etaLine = lines.find((l) => /\bmin\b|minutes|delivery time/i.test(l)) || null;
    const eta = etaLine?.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})\s*min/i)?.[0] ?? null;
    const areaLine = lines.find((l) => l.includes("→") && /(Road|Colony|Nagar|Main|Marg|Park|Bazaar|Complex|Building|Street|Lane)/i.test(l)) || null;
    return {
      ...parsed,
      siteName: brand,
      isZomato: brand === "Zomato",
      isSwiggy: brand === "Swiggy",
      eta: eta || null,
      area: areaLine ? areaLine.replace(/\s*→.*$/, "").trim() : null,
    };
  } catch {
    return null;
  }
}

function restaurantFallback(url: string, brand: "Zomato" | "Swiggy"): LinkPreview {
  return {
    ...blankFallback(url, brand),
    isZomato: brand === "Zomato",
    isSwiggy: brand === "Swiggy",
  };
}

/* ---------------- Pinterest (pin — OG) ---------------- */

export function isPinterestUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host === "pinterest.com" || host.endsWith(".pinterest.com") || host.endsWith(".pin.it");
  } catch {
    return false;
  }
}

async function fetchPinterestPreview(url: string): Promise<LinkPreview | null> {
  const og = await fetchOgWithFallback(url, "Pinterest");
  if (!og) return null;
  return { ...og, siteName: og.siteName || "Pinterest", isPinterest: true };
}

function pinterestFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "Pinterest"), isPinterest: true };
}

/* ---------------- App Store / Play Store (app — iTunes lookup keyless) ---------------- */

export function appPlatformFromUrl(url: string): "ios" | "android" | null {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    if (host === "apps.apple.com" || host === "itunes.apple.com") return "ios";
    if (host === "play.google.com" || host === "play.x.google.com") return "android";
    return null;
  } catch {
    return null;
  }
}

export function isAppUrl(url: string): boolean {
  return appPlatformFromUrl(url) != null;
}

/** Parse the numeric id from an App Store URL (`/app/<name>/id1234` or `?id=…`). */
export function parseAppStoreId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.toLowerCase().includes("apple.com")) return null;
    const m = u.pathname.match(/id(\d{6,12})/) || u.search.match(/[?&]id=(\d{6,12})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function fetchItunesApp(id: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: Record<string, unknown>[] };
    const a = json.results?.[0];
    if (!a) return null;
    const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
    const name = str(a.trackName) || "";
    const artwork = str(a.artworkUrl512 || a.artworkUrl600 || a.artworkUrl100 || a.artworkUrl60);
    const updated = str(a.currentVersionReleaseDate);
    return {
      ...blankFallback(`https://apps.apple.com/app/id${id}`, "App Store"),
      title: name || `App ${id}`,
      description: str(a.description) || "",
      image: artwork,
      isApp: true,
      appPlatform: "ios",
      author: str(a.sellerName) || null,
      category: str(a.primaryGenreName) || null,
      downloads: updated ? `Updated ${new Date(updated).getUTCFullYear()}` : null,
      commercePrice: typeof a.formattedPrice === "string" && !/free/i.test(a.formattedPrice) ? str(a.formattedPrice) : null,
      commerceRating: numOr(a.averageUserRating),
      commerceReviews: numOr(a.userRatingCount),
    };
  } catch {
    return null;
  }
}

async function fetchPlayApp(url: string): Promise<LinkPreview | null> {
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    // fall through
  }
  if (html) {
    const og = parseOpenGraph(html, url);
    const downloads =
      html.match(/<div[^>]+role=["']img["'][^>]+aria-label=["']([\d,.]+[KMB]?\+?)\s*Downloads/i)?.[1] ||
      html.match(/\b([\d,.]+[KMB]?\+?)\s*Downloads/i)?.[1] ||
      html.match(/interactionCount["']?\s*[:=]\s*["']?UserDownloads:(\d+)/i)?.[1] ||
      null;
    const ratingMatch = html.match(/aria-label=["']Rated ([\d.]+) stars/i)?.[1] || html.match(/itemprop=["']ratingValue["'][^>]*content=["']([\d.]+)["']/i)?.[1];
    const countMatch = html.match(/itemprop=["']ratingCount["'][^>]*content=["'](\d+)["']/i)?.[1];
    return {
      ...og,
      siteName: "Google Play",
      isApp: true,
      appPlatform: "android",
      downloads,
      commerceRating: ratingMatch ? parseFloat(ratingMatch) || null : null,
      commerceReviews: countMatch ? parseInt(countMatch, 10) || null : null,
    };
  }
  try {
    const res = await fetch(`https://r.jina.ai/${url}`);
    if (!res.ok) return null;
    const md = await res.text();
    if (!md || !md.trim()) return null;
    const downloads = md.match(/([\d,.]+[KMB]?\+?)\s*Downloads/i)?.[1] || null;
    return { ...parseMarkdown(md, url), siteName: "Google Play", isApp: true, appPlatform: "android", downloads };
  } catch {
    return null;
  }
}

async function fetchAppPreview(url: string): Promise<LinkPreview | null> {
  const platform = appPlatformFromUrl(url);
  if (!platform) return null;
  if (platform === "ios") {
    const id = parseAppStoreId(url);
    if (id) {
      const itunes = await fetchItunesApp(id);
      if (itunes) return itunes;
    }
    return fetchOgWithFallback(url, "App Store");
  }
  return fetchPlayApp(url);
}

function appFallback(url: string, platform: "ios" | "android"): LinkPreview {
  return {
    ...blankFallback(url, platform === "ios" ? "App Store" : "Google Play"),
    isApp: true,
    appPlatform: platform,
  };
}

/* ---------------- Airbnb / stay (listing — OG + markdown) ---------------- */

export function isStayUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host.includes("airbnb.") || host === "booking.com" || host.endsWith(".booking.com");
  } catch {
    return false;
  }
}

async function fetchStayPreview(url: string): Promise<LinkPreview | null> {
  const base = await fetchOgWithFallback(url, "Airbnb");
  if (!base) return null;
  let hostName: string | null = null;
  try {
    const res = await fetch(`https://r.jina.ai/${url}`);
    if (res.ok) {
      const md = await res.text();
      const line = md.split("\n").find((l) => /hosted by/i.test(l)) || null;
      const m = line?.match(/Hosted by\s+([A-Za-z][A-Za-z\s'.,-]{0,40})/i);
      if (m) hostName = cleanText(m[1]) || null;
    }
  } catch {
    // best-effort only
  }
  return { ...base, isStay: true, hostName };
}

function stayFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "Airbnb"), isStay: true };
}

/* ---------------- Steam (game — keyless storefront API) ---------------- */

export function isGameUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host.includes("store.steampowered.com") || host.includes("steamcommunity.com");
  } catch {
    return false;
  }
}

export function parseSteamAppId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    const m = u.pathname.match(/\/app\/(\d{1,10})\/?/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function fetchGamePreview(url: string): Promise<LinkPreview | null> {
  const appId = parseSteamAppId(url);
  if (appId) {
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}`);
      if (!res.ok) throw new Error();
      const json = (await res.json()) as Record<string, { success?: boolean; data?: Record<string, unknown> }>;
      const data = json[appId]?.data;
      if (json[appId]?.success && data) {
        const genres = (data.genres as { description?: string }[] | undefined)?.map((g) => g.description).filter(Boolean).join(", ") || null;
        const screens = data.screenshots as { path_full?: string }[] | undefined;
        const release = data.release_date as { date?: string } | undefined;
        const price = data.price_overview as { final?: number; final_formatted?: string; currency?: string } | undefined;
        let priceLabel: string | null = null;
        if (price && price.final !== 0) {
          priceLabel =
            typeof price.final_formatted === "string"
              ? price.final_formatted
              : formatSteamPrice(price.final ?? 0, typeof price.currency === "string" ? price.currency : "");
        }
        return {
          ...blankFallback(`https://store.steampowered.com/app/${appId}`, "Steam"),
          title: typeof data.name === "string" ? data.name : "Steam game",
          description: typeof data.short_description === "string" ? cleanText(data.short_description) : "",
          image: screens?.[0]?.path_full || (typeof data.header_image === "string" ? data.header_image : null),
          isGame: true,
          genre: genres,
          releaseDate: release?.date || null,
          commerceRating: numOr((data.metacritic as { score?: unknown } | undefined)?.score),
          commercePrice: priceLabel,
        };
      }
    } catch {
      // fall through to OG
    }
  }
  const og = await fetchOgWithFallback(url, "Steam");
  if (!og) return null;
  return { ...og, isGame: true };
}

function formatSteamPrice(cents: number, currency: string): string | null {
  if (cents === 0) return null;
  const sym = CURRENCY_SYMBOLS[currency] || `${currency} `;
  const value = (cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 });
  return `${sym}${value}`;
}

function gameFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "Steam"), isGame: true };
}

/* ---------------- Book (Goodreads Book JSON-LD / Open Library / Google Books) ---------------- */

export function isBookUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host.includes("goodreads.") || host === "books.google.com" || host.includes("openlibrary.org");
  } catch {
    return false;
  }
}

export function parseGoodreadsJsonLd(html: string): {
  title?: string;
  author?: string;
  image?: string;
  pages?: number;
  rating?: number;
  reviews?: number;
} | null {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data: unknown;
    try {
      data = JSON.parse(inner);
    } catch {
      continue;
    }
    const node = findLdNode(data, ["Book"]);
    if (!node) continue;
    const authorNode = firstObj(node.author) || {};
    const author = typeof authorNode.name === "string" ? cleanText(authorNode.name) : null;
    const agg = firstObj(node.aggregateRating) || {};
    const img = typeof node.image === "string" ? node.image : Array.isArray(node.image) ? String(node.image[0] ?? "") : null;
    return {
      title: typeof node.name === "string" ? cleanText(node.name) : undefined,
      author: author || undefined,
      image: img || undefined,
      pages: numOr(node.numberOfPages) ?? undefined,
      rating: numOr(agg.ratingValue) ?? undefined,
      reviews: numOr(agg.reviewCount) ?? undefined,
    };
  }
  return null;
}

async function fetchBookPreview(url: string): Promise<LinkPreview | null> {
  const og = await fetchOgWithFallback(url, "Goodreads");
  if (!og) return null;
  let ld: ReturnType<typeof parseGoodreadsJsonLd> = null;
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    // no structured data — best-effort is fine
  }
  if (html) ld = parseGoodreadsJsonLd(html);
  return {
    ...og,
    siteName: og.siteName || "Goodreads",
    isBook: true,
    author: ld?.author || og.author,
    pages: ld?.pages ?? null,
    commerceRating: ld?.rating ?? null,
    commerceReviews: ld?.reviews ?? null,
  };
}

function bookFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "Goodreads"), isBook: true };
}

/* ---------------- Amazon Kindle / books — the generic Amazon commerce
       pipeline below still handles physical products. ---------------- */

/** Amazon `amazon.*` URLs that may be a book: Kindle store or product paths. */
export function isAmazonBookUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("amazon.")) return false;
    return /(^|\/)(kindle\/|dp\/|gp\/product\/)/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

/** Parse an Amazon book page's `Book` JSON-LD block (title/author/pages/rating). */
export function parseAmazonBookJsonLd(html: string): {
  title?: string;
  author?: string;
  image?: string;
  pages?: number;
  rating?: number;
  reviews?: number;
} | null {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data: unknown;
    try {
      data = JSON.parse(inner);
    } catch {
      continue;
    }
    const node = findLdNode(data, ["Book"]);
    if (!node) continue;
    const authorField = node.author;
    const author = typeof authorField === "string"
      ? cleanText(authorField)
      : firstObj(authorField)?.name
        ? String(firstObj(authorField)?.name)
        : null;
    const agg = firstObj(node.aggregateRating) || {};
    const img = typeof node.image === "string" ? node.image : Array.isArray(node.image) ? String(node.image[0] ?? "") : null;
    return {
      title: typeof node.name === "string" ? cleanText(node.name) : undefined,
      author: author || undefined,
      image: img || undefined,
      pages: numOr(node.numberOfPages) ?? undefined,
      rating: numOr(agg.ratingValue) ?? undefined,
      reviews: numOr(agg.reviewCount) ?? undefined,
    };
  }
  return null;
}

/**
 * Fetch a Kindle/Amazon book page. Returns a `book` preview only when the
 * page confirms it is a book (Book JSON-LD or an explicit `/kindle/` path);
 * otherwise returns `null` so the URL falls through to the Amazon commerce
 * pipeline.
 */
async function fetchKindlePreview(url: string): Promise<LinkPreview | null> {
  const isKindlePath = /(^|\/)(kindle\/)/i.test(new URL(url).pathname);
  let html: string | null = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("<")) html = text;
    }
  } catch {
    // fall through
  }
  const ld = html ? parseAmazonBookJsonLd(html) : null;
  if (!ld && !isKindlePath) return null;

  const og = await fetchOgWithFallback(url, "Amazon");
  const base = og || { ...blankFallback(url, "Amazon"), isBook: true };
  return {
    ...base,
    siteName: base.siteName || "Amazon",
    title: ld?.title || base.title,
    image: ld?.image || amazonImageFromUrl(url) || base.image,
    isBook: true,
    isKindle: true,
    author: ld?.author || base.author,
    pages: ld?.pages ?? null,
    commerceRating: ld?.rating ?? null,
    commerceReviews: ld?.reviews ?? null,
  };
}

/* ---------------- Product Hunt (launch — OG; upvotes manual) ---------------- */

export function isLaunchUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host === "producthunt.com" || host.endsWith(".producthunt.com");
  } catch {
    return false;
  }
}

async function fetchLaunchPreview(url: string): Promise<LinkPreview | null> {
  const og = await fetchOgWithFallback(url, "Product Hunt");
  if (!og) return null;
  return { ...og, siteName: "Product Hunt", isLaunch: true };
}

function launchFallback(url: string): LinkPreview {
  return { ...blankFallback(url, "Product Hunt"), isLaunch: true };
}

/* ---------------- Entertainment, podcasts & reading platforms ---------------- */

export function isYouTubeMusicUrl(url: string): boolean {
  try {
    return new URL(url.trim()).hostname.toLowerCase() === "music.youtube.com";
  } catch {
    return false;
  }
}

export function isJioSaavnUrl(url: string): boolean {
  return hostIs(url, "jiosaavn.com", "saavn.com");
}

export function isGaanaUrl(url: string): boolean {
  return hostIs(url, "gaana.com");
}

export function isAppleMusicUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host === "music.apple.com" || host.endsWith(".music.apple.com");
  } catch {
    return false;
  }
}

export function isNetflixUrl(url: string): boolean {
  return hostIs(url, "netflix.com");
}

export function isPrimeVideoUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    if (host === "primevideo.com" || host.endsWith(".primevideo.com")) return true;
    return host.endsWith("amazon.com") && /\/gp\/video\//i.test(u.pathname);
  } catch {
    return false;
  }
}

export function isHotstarUrl(url: string): boolean {
  return hostIs(url, "hotstar.com", "disneyplushotstar.com");
}

export function isPocketFmUrl(url: string): boolean {
  return hostIs(url, "pocketfm.in", "pocketfm.com");
}

export function isKukuFmUrl(url: string): boolean {
  return hostIs(url, "kukufm.com", "kukufm.in");
}

export function isApplePodcastsUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host === "podcasts.apple.com" || host.endsWith(".podcasts.apple.com");
  } catch {
    return false;
  }
}

export function isWattpadUrl(url: string): boolean {
  return hostIs(url, "wattpad.com");
}

export function isPratilipiUrl(url: string): boolean {
  if (hostIs(url, "pratilipi.com")) return true;
  // Branch.io mobile-share links (pratilipi.app.link/…) — detect pre-redirect
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return host === "pratilipi.app.link";
  } catch {
    return false;
  }
}

export function isWebtoonUrl(url: string): boolean {
  return hostIs(url, "webtoons.com");
}

export function isMediumUrl(url: string): boolean {
  return hostIs(url, "medium.com");
}

/** Fetch-then-fallback for a generic brand flag; returns the finished preview. */
async function brandChain(
  url: string,
  siteName: string,
  flags: Partial<LinkPreview>,
  finish: (preview: LinkPreview) => LinkPreview,
): Promise<LinkPreview> {
  const preview = await fetchBrandPreview(url, siteName, flags);
  return finish(preview || brandFallback(url, siteName, flags));
}

/** Direct fetch + platform-specific parser, with a flagged skeleton on failure. */
async function blogChain(
  url: string,
  siteName: string,
  flags: Partial<LinkPreview>,
  parse: (html: string, url: string) => LinkPreview | null,
  finish: (preview: LinkPreview) => LinkPreview,
): Promise<LinkPreview> {
  let parsed: LinkPreview | null = null;
  try {
    const res = await fetch(url, { headers: { Accept: "text/html,application/xhtml+xml" } });
    if (res.ok) {
      const html = await res.text();
      if (html && html.includes("<")) parsed = parse(html, url);
    }
  } catch {
    parsed = null;
  }
  if (parsed) return finish({ ...parsed, ...flags });
  return finish(brandFallback(url, siteName, flags));
}

/** 65 → "1:05", 3665 → "1:01:05". */
export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(rest).padStart(2, "0")}`;
}

/** 1500 → "1.5K", 2_300_000 → "2.3M". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${trimCompact(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${trimCompact(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trimCompact(n / 1_000)}K`;
  return String(n);
}

function trimCompact(n: number): string {
  return String(Math.round(n * 10) / 10).replace(/\.0$/, "");
}

function normalizeUrl(input: string): string | null {
  let url = input.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

type ResolvedPage = { url: string; html: string };

function proxiedImageUrl(url: string | null): string | null {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  const worker = getWorkerBaseUrl();
  return worker ? `${worker}/image?url=${encodeURIComponent(url)}` : url;
}

/**
 * Short URLs (tinyurl, bit.ly, t.co …) often respond with an interstitial
 * "preview" page instead of an HTTP redirect: the redirect chain lands on the
 * shortener's own host (e.g. tinyurl.com/preview/…/CODE) and the real
 * destination is only exposed through `<meta property="og:url">`, the canonical
 * link, or a meta-refresh. When the page points at a *different* host than the
 * one we landed on, treat it as an interstitial and return that destination.
 */
function interstitialDestination(html: string, landed: string): string | null {
  const grab = (): string | null => {
    const patterns = [
      /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i,
      /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["']/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) return m[1];
    }
    const refresh = html.match(
      /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url\s*=\s*["']?([^"';\s>]+)/i,
    );
    return refresh ? refresh[1] : null;
  };

  const raw = grab();
  if (!raw) return null;
  let normalized: string | null = null;
  try {
    normalized = normalizeUrl(new URL(raw, landed).toString());
  } catch {
    return null;
  }
  if (!normalized) return null;
  let landedHost: string;
  try {
    landedHost = new URL(landed).hostname.toLowerCase();
  } catch {
    return null;
  }
  let destHost: string;
  try {
    destHost = new URL(normalized).hostname.toLowerCase();
  } catch {
    return null;
  }
  // Same-host canonical tags are ordinary page hygiene — only refetch when the
  // destination is genuinely on another host.
  return destHost === landedHost ? null : normalized;
}

async function resolvePage(url: string): Promise<ResolvedPage | null> {
  const worker = getWorkerBaseUrl();
  if (worker) {
    try {
      const response = await fetch(`${worker}/resolve?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const payload = await response.json() as Partial<ResolvedPage>;
        const canonical = typeof payload.url === "string" ? normalizeUrl(payload.url) : null;
        if (canonical && typeof payload.html === "string" && payload.html.includes("<")) {
          return { url: canonical, html: payload.html };
        }
      }
    } catch {
      // Fall back to a direct fetch on native or CORS-permissive sites.
    }
  }

  // Follow HTTP redirects, and when a shortener answers with an interstitial
  // page instead, follow the canonical destination it points at (bounded loop
  // against bounce chains and self-referential canonical links).
  const seen = new Set<string>();
  let current = url;
  let lastDest: string | null = null;
  for (let hop = 0; hop < 4; hop++) {
    const key = normalizeUrl(current) || current;
    if (seen.has(key)) break;
    seen.add(key);

    let response: Response;
    try {
      response = await fetch(current, { headers: { Accept: "text/html,application/xhtml+xml" } });
    } catch {
      return lastDest ? { url: lastDest, html: "" } : null;
    }
    if (!response.ok) return lastDest ? { url: lastDest, html: "" } : null;

    const html = await response.text();
    if (!html.includes("<")) return lastDest ? { url: lastDest, html: "" } : null;

    const landed = normalizeUrl(response.url) || current;
    const dest = interstitialDestination(html, landed);
    if (dest && !seen.has(normalizeUrl(dest) || dest)) {
      lastDest = dest;
      current = dest;
      continue;
    }
    return { url: landed, html };
  }
  return lastDest ? { url: lastDest, html: "" } : null;
}

/** Last-resort redirect resolution, used only when we cannot read the page
 *  body (cross-origin CORS on the web build, bot walls, flaky hosts). Returns
 *  the post-redirect URL so that platform detection still runs against the
 *  link the redirect actually lands on — for every platform, not just this
 *  one. A cheap HEAD chase handles native; a server-side expander covers web. */
async function resolveRedirectOnly(url: string): Promise<string | null> {
  const seen = new Set<string>();
  let current = url;
  let moved = false;

  // Chase redirects with HEAD requests (no body read — works even when the
  // page content itself is blocked). Exhausts the chain via Location headers.
  for (let hop = 0; hop < 4; hop++) {
    const key = normalizeUrl(current) || current;
    if (seen.has(key)) break;
    seen.add(key);

    let response: Response;
    try {
      response = await fetch(current, { method: "HEAD", redirect: "manual" });
    } catch {
      break;
    }
    const location = response.headers.get("location");
    if (location) {
      const next = normalizeUrl(new URL(location, current).toString());
      if (next && next !== key && !seen.has(next)) {
        moved = true;
        current = next;
        continue;
      }
    }
    if (response.ok && moved) {
      const finalUrl = normalizeUrl(response.url) || current;
      return finalUrl;
    }
    break;
  }

  try {
    const response = await fetch(`https://unshorten.me/json/${encodeURIComponent(url)}`);
    if (response.ok) {
      const payload = (await response.json()) as {
        success?: boolean;
        resolved_url?: string;
      };
      const dest = normalizeUrl(payload.resolved_url || "");
      const key = normalizeUrl(url) || url;
      if (payload.success && dest && dest !== key) return dest;
    }
  } catch {
    // fall through — detection falls back to the original URL
  }
  return null;
}

function withProxiedAssets(preview: LinkPreview): LinkPreview {
  const amazonImage = commerceStoreFromUrl(preview.url) === "amazon"
    ? amazonImageFromUrl(preview.url)
    : null;
  const image = amazonImage || preview.image;
  return {
    ...preview,
    image,
    imageFallback: image ? proxiedImageUrl(image) : null,
  };
}

/**
 * Fetch a link and build a preview. Tweet/X status URLs go through the
 * no-auth oEmbed endpoint first; everything else tries raw HTML, then the
 * `r.jina.ai` reader proxy. On platforms/hosts where CORS blocks direct
 * fetches (common on web), we fall through to the next source.
 */
export async function fetchLinkPreview(input: string): Promise<LinkPreview> {
  const normalized = normalizeUrl(input);
  if (!normalized) {
    throw new Error('Please enter a valid URL');
  }
  const resolvedPage = await resolvePage(normalized);
  let url = resolvedPage?.url || normalized;
  if (!resolvedPage) {
    // Couldn't read the page body (CORS/bot wall) — still resolve and detect
    // against the post-redirect URL so every platform template matches.
    const finalUrl = await resolveRedirectOnly(normalized);
    if (finalUrl) url = finalUrl;
  }

  const finish = (preview: LinkPreview) => withProxiedAssets(preview);

  if (isXArticleUrl(url)) {
    const xa = await fetchXArticlePreview(url);
    if (xa) return finish(xa);
    return finish(brandFallback(url, "X", { isTweet: true, isXArticle: true }));
  }

  if (isTweetUrl(url)) {
    // The page HTML was already fetched by resolvePage — sniff it for an article.
    if (resolvedPage?.html && detectXArticle(resolvedPage.html)) {
      return finish(buildXArticlePreview(url, resolvedPage.html, parseOpenGraph(resolvedPage.html, url)));
    }
    const tweet = await fetchTweetPreview(url);
    if (tweet) return finish(tweet);
    // oEmbed unreachable — still flag as tweet so the UI auto-switches
    // template and the user can fill details manually.
    return finish(tweetFallback(url));
  }

  if (isYouTubeMusicUrl(url)) {
    const yt = await fetchYouTubePreview(url);
    const base = yt || youtubeFallback(url);
    return finish({
      ...base,
      isYouTube: false,
      isYouTubeMusic: true,
      siteName: base.siteName || "YouTube Music",
    });
  }

  if (isYouTubeUrl(url)) {
    const yt = await fetchYouTubePreview(url);
    if (yt) return finish(yt);
    return finish(youtubeFallback(url));
  }

  if (isNetflixUrl(url)) return brandChain(url, "Netflix", { isNetflix: true }, finish);
  if (isPrimeVideoUrl(url)) return brandChain(url, "Prime Video", { isPrimeVideo: true }, finish);
  if (isHotstarUrl(url)) return brandChain(url, "Hotstar", { isHotstar: true }, finish);
  if (isJioSaavnUrl(url)) return brandChain(url, "JioSaavn", { isJioSaavn: true }, finish);
  if (isGaanaUrl(url)) return brandChain(url, "Gaana", { isGaana: true }, finish);
  if (isAppleMusicUrl(url)) return brandChain(url, "Apple Music", { isAppleMusic: true }, finish);
  if (isKukuFmUrl(url)) return brandChain(url, "Kuku FM", { isKukuFm: true }, finish);
  if (isApplePodcastsUrl(url)) return brandChain(url, "Apple Podcasts", { isApplePodcasts: true }, finish);
  if (isPocketFmUrl(url)) return brandChain(url, "Pocket FM", { isPocketFm: true }, finish);
  if (isWattpadUrl(url)) return brandChain(url, "Wattpad", { isWattpad: true }, finish);
  if (isPratilipiUrl(url)) return brandChain(url, "Pratilipi", { isPratilipi: true }, finish);
  if (isWebtoonUrl(url)) return brandChain(url, "Webtoon", { isWebtoon: true }, finish);
  if (isMediumUrl(url)) return brandChain(url, "Medium", { isMedium: true }, finish);

  if (isSubstackUrl(url)) {
    return blogChain(url, "Substack", { isSubstack: true }, parseSubstackHtml, finish);
  }
  if (isDevToUrl(url)) {
    return blogChain(url, "DEV Community", { isDevTo: true }, parseDevToHtml, finish);
  }
  if (isHashnodeUrl(url)) {
    return blogChain(url, "Hashnode", { isHashnode: true }, parseHashnodeHtml, finish);
  }
  if (isBlogspotUrl(url)) {
    return blogChain(url, "Blogger", { isBlogspot: true }, parseBloggerHtml, finish);
  }
  if (isWordPressUrl(url)) {
    return blogChain(url, "WordPress", { isWordPress: true }, parseWordPressHtml, finish);
  }

  if (isTikTokUrl(url)) {
    const tt = await fetchTikTokPreview(url);
    if (tt) return finish(tt);
    return finish(tiktokFallback(url));
  }

  if (isTwitchUrl(url)) {
    const tw = await fetchTwitchPreview(url);
    if (tw) return finish(tw);
    // No worker/creds — still flag as Twitch so the UI auto-switches
    // template and the user can fill details manually.
    return finish(twitchFallback(url));
  }

  if (isRedditUrl(url)) {
    const rd = await fetchRedditPreview(url);
    if (rd) return finish(rd);
    return finish(redditFallback(url));
  }

  if (isSpotifyUrl(url)) {
    const sp = await fetchSpotifyPreview(url);
    if (sp) return finish(sp);
    return finish(spotifyFallback(url));
  }

  if (isGitHubUrl(url)) {
    const gh = await fetchGitHubPreview(url);
    if (gh) return finish(gh);
    return finish(githubFallback(url));
  }

  if (isLinkedInUrl(url)) {
    const li = await fetchLinkedInPreview(url);
    if (li) return finish(li);
    // Without a readable source the template still auto-selects.
    return finish(
      isLinkedInArticleUrl(url)
        ? { ...linkedInFallback(url), isLinkedInArticle: true }
        : linkedInFallback(url),
    );
  }

  if (isIndeedUrl(url)) {
    const jd = await fetchIndeedPreview(url);
    if (jd) return finish(jd);
    return finish(indeedFallback(url));
  }

  if (isZomatoUrl(url)) {
    const rz = await fetchRestaurantPreview(url, "Zomato");
    if (rz) return finish(rz);
    return finish(restaurantFallback(url, "Zomato"));
  }

  if (isSwiggyUrl(url)) {
    const rs = await fetchRestaurantPreview(url, "Swiggy");
    if (rs) return finish(rs);
    return finish(restaurantFallback(url, "Swiggy"));
  }

  if (isPinterestUrl(url)) {
    const pn = await fetchPinterestPreview(url);
    if (pn) return finish(pn);
    return finish(pinterestFallback(url));
  }

  if (isAppUrl(url)) {
    const ap = await fetchAppPreview(url);
    if (ap) return finish(ap);
    return finish(appFallback(url, appPlatformFromUrl(url) ?? "ios"));
  }

  if (isStayUrl(url)) {
    const st = await fetchStayPreview(url);
    if (st) return finish(st);
    return finish(stayFallback(url));
  }

  if (isGameUrl(url)) {
    const gm = await fetchGamePreview(url);
    if (gm) return finish(gm);
    return finish(gameFallback(url));
  }

  if (isBookUrl(url)) {
    const bk = await fetchBookPreview(url);
    if (bk) return finish(bk);
    return finish(bookFallback(url));
  }

  if (isAmazonBookUrl(url)) {
    const kd = await fetchKindlePreview(url);
    if (kd) return finish(kd);
    // Not a book (or the page was blocked) — fall through to the Amazon
    // commerce parse so gadgets stay on the commerce template.
  }

  if (isLaunchUrl(url)) {
    const lc = await fetchLaunchPreview(url);
    if (lc) return finish(lc);
    return finish(launchFallback(url));
  }

  if (isEbayUrl(url)) {
    const eb = await fetchEbayPreview(url);
    if (eb) return finish(eb);
    // fall through to the generic chain; withCommerce() still flags it
  }

  if (isEtsyUrl(url) || isWalmartUrl(url)) {
    const store = isEtsyUrl(url) ? "etsy" : "walmart";
    const bespoke = await fetchBespokeCommercePreview(url, store);
    if (bespoke) return finish(bespoke);
    // fall through to the generic chain; withCommerce() still flags it
  }

  // Amazon / Flipkart / Meesho / AliExpress: best-effort PDP parse, else generic + manual.
  const store = commerceStoreFromUrl(url);
  if (store === "amazon" || store === "flipkart" || store === "meesho" || store === "aliexpress") {
    const mp = await fetchMarketplacePreview(url, store);
    if (mp) return finish(mp);
    // fall through to the generic chain; withCommerce() still flags it
  }

  const html = resolvedPage?.html || '';

  if (html) {
    return finish(withCommerce(parseOpenGraph(html, url), url));
  }

  const proxy = `https://r.jina.ai/${url}`;
  try {
    const res = await fetch(proxy);
    if (!res.ok) throw new Error();
    const text = await res.text();
    if (text) {
      return finish(withCommerce(parseMarkdown(text, url), url));
    }
  } catch {
    // fall through
  }

  throw new Error('Could not load the page. Check the URL and try again.');
}

/** Parse Open Graph/standard meta tags from raw HTML. */
export function parseOpenGraph(html: string, url: string): LinkPreview {
  const getMeta = (attr: 'property' | 'name', key: string): string | null => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `<meta[^>]*${attr}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*/?>`,
      'i',
    );
    const regex2 = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${escaped}["'][^>]*/?>`,
      'i',
    );
    const m = html.match(regex) || html.match(regex2);
    return m ? decodeEntities(m[1]).trim() || null : null;
  };

  const getTitle = (): string => {
    const og = getMeta('property', 'og:title') || getMeta('name', 'twitter:title');
    if (og) return og;
    const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return t ? decodeEntities(t[1]).trim() : '';
  };

  const getDesc = (): string => {
    const og =
      getMeta('property', 'og:description') ||
      getMeta('name', 'twitter:description') ||
      getMeta('name', 'description');
    return og ?? '';
  };

  const getImage = (): string | null => {
    const og =
      getMeta('property', 'og:image:secure_url') ||
      getMeta('property', 'og:image:url') ||
      getMeta('property', 'og:image') ||
      getMeta('name', 'twitter:image:src') ||
      getMeta('name', 'twitter:image');
    if (og) return resolveUrl(og, url);
    const ldImage = getJsonLdImage(html);
    if (ldImage) return resolveUrl(ldImage, url);
    const tag = html.match(/<img[^>]+(?:data-old-hires|data-src|data-lazy-src|src)=["']([^"']+)["'][^>]*>/i);
    return tag ? resolveUrl(decodeEntities(tag[1]), url) : null;
  };

  const getFavicon = (): string | null => {
    const relIcon =
      html.match(/<link[^>]+rel=["'](?:shortcut\s+)?icon["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*>/i)?.[1] ||
      html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["'][^>]*>/i)?.[1];
    if (!relIcon) return null;
    const resolved = resolveUrl(relIcon, url);
    return /^data:/i.test(resolved) ? null : resolved;
  };

  const getSiteName = (): string | null => {
    return (
      getMeta('property', 'og:site_name') ||
      getMeta('name', 'application-name') ||
      getMeta('name', 'apple-mobile-web-app-title') ||
      getJsonLdPublisher(html)
    );
  };

  const getAuthor = (): string | null => {
    return (
      getMeta('property', 'article:author') ||
      getMeta('name', 'author') ||
      getMeta('property', 'og:article:author') ||
      getMeta('name', 'twitter:creator') ||
      getMeta('name', 'twitter:site')
    );
  };

  const getPublishedAt = (): string | null => {
    return (
      getMeta('property', 'article:published_time') ||
      getMeta('property', 'article:modified_time') ||
      getMeta('name', 'datePublished') ||
      getMeta('name', 'publish_date') ||
      getMeta('property', 'og:published_time')
    );
  };

  const title = getTitle() || url;
  const description = getDesc();

  return {
    ...platformDefaults(),
    url,
    title,
    description,
    image: getImage(),
    favicon: getFavicon(),
    siteName: getSiteName(),
    author: getAuthor(),
    readingMinutes: estimateReadingMinutes(`${title} ${description}`),
    publishedAt: getPublishedAt(),
    isTweet: isTweetUrl(url),
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: isYouTubeUrl(url),
    youtubeKind: isYouTubeUrl(url) ? youtubeKindFromUrl(url) : null,
    youtubeId: parseYouTubeId(url),
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
  };
}

function getJsonLdNodes(html: string): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, ""));
      const pending: unknown[] = Array.isArray(value) ? [...value] : [value];
      while (pending.length) {
        const item = pending.shift();
        if (!item || typeof item !== "object") continue;
        const node = item as Record<string, unknown>;
        nodes.push(node);
        if (Array.isArray(node["@graph"])) pending.push(...node["@graph"]);
      }
    } catch {
      // Invalid JSON-LD is common; ignore it and keep parsing metadata.
    }
  }
  return nodes;
}

function getJsonLdImage(html: string): string | null {
  for (const node of getJsonLdNodes(html)) {
    const image = node.image;
    if (typeof image === "string") return image;
    if (Array.isArray(image) && typeof image[0] === "string") return image[0];
    if (image && typeof image === "object" && typeof (image as Record<string, unknown>).url === "string") {
      return (image as Record<string, string>).url;
    }
  }
  return null;
}

function getJsonLdPublisher(html: string): string | null {
  for (const node of getJsonLdNodes(html)) {
    for (const candidate of [node.publisher, node.provider, node.brand]) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
      if (candidate && typeof candidate === "object") {
        const name = (candidate as Record<string, unknown>).name;
        if (typeof name === "string" && name.trim()) return name.trim();
      }
    }
  }
  return null;
}

/** Parse the `r.jina.ai` markdown reader output. */
export function parseMarkdown(md: string, url: string): LinkPreview {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  })();

  const titleMatch = md.match(/^Title:\s*(.+)$/m);
  const urlSourceMatch = md.match(/^URL Source:\s*(.+)$/m);
  const descMatch = md.match(/^Description:\s*(.+)$/m);

  const imageMatch =
    md.match(/^!(?:\[[^\]]*\]\()?\s*https?:\/\/[^\s)]+/m) ||
    md.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/) ||
    md.match(/\[!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)\]/);

  let image: string | null = null;
  if (imageMatch) {
    const raw = imageMatch[1] || imageMatch[0];
    const m = /https?:\/\/[^\s)]+/.exec(raw);
    if (m) image = m[0].replace(/\]\)$/, '');
  }

  const title = titleMatch ? titleMatch[1].trim() : (host ?? url);
  const description = descMatch ? descMatch[1].trim() : '';

  return {
    url: urlSourceMatch ? (urlSourceMatch[1].trim() || url) : url,
    title,
    description,
    image,
    siteName: host,
    author: null,
    readingMinutes: estimateReadingMinutes(`${title} ${description}`),
    publishedAt: null,
    isTweet: isTweetUrl(url),
    handle: null,
    avatar: null,
    verified: false,
    likeCount: null,
    replyCount: null,
    isYouTube: isYouTubeUrl(url),
    youtubeKind: isYouTubeUrl(url) ? youtubeKindFromUrl(url) : null,
    youtubeId: parseYouTubeId(url),
    durationSec: null,
    viewCount: null,
    channelThumb: null,
    scheduledStart: null,
    concurrentViewers: null,
    ...platformDefaults(),
  };
}

function resolveUrl(src: string, base: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200) || 2);
}

export function formatDateLabel(iso: string | null): string {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function decodeEntities(s: string): string {
  if (!s) return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)));
}
