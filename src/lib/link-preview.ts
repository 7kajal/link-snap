export type YouTubeKind = "video" | "short" | "live" | "premiere";

export type SpotifyKind = "track" | "album" | "playlist" | "artist" | "show" | "episode";

export type TwitchKind = "live" | "clip" | "video" | "channel";

export type CommerceStore = "amazon" | "flipkart" | "meesho" | "ebay" | "etsy" | "other";

export type LinkPreview = {
  url: string;
  title: string;
  description: string;
  image: string | null;
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
  // Author avatar is not included in oEmbed; best-effort <img> extraction.
  let avatar: string | null = null;
  const img = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (img) avatar = img[1];

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
      thumbnail_url?: string;
    };
    if (!json || !json.title) return null;
    const base = youtubeFallback(url);
    return {
      ...base,
      title: json.title,
      author: json.author_name || null,
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
    if (host.includes("ebay.")) return "ebay";
    if (host.includes("etsy.")) return "etsy";
    return null;
  } catch {
    return null;
  }
}

/** Flag generic OG/markdown results from known stores as commerce. */
export function withCommerce(base: LinkPreview, url: string): LinkPreview {
  const store = commerceStoreFromUrl(url);
  if (!store) return base;
  return { ...base, isCommerce: true, commerceStore: store, siteName: base.siteName || store };
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

/** Extract the first Product JSON-LD block from item HTML. */
export function parseEbayJsonLd(html: string): {
  name?: string;
  image?: string;
  price?: string;
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
      return {
        name: typeof n.name === "string" ? n.name : undefined,
        image: typeof img === "string" ? img : undefined,
        price: offers && (offers.price ?? offers.lowPrice) != null ? String(offers.price ?? offers.lowPrice) : undefined,
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
  if (store !== "amazon" && store !== "flipkart" && store !== "meesho") return null;
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || !html.includes("<")) return null;
    if (store === "amazon") return parseAmazonHtml(html, url);
    if (store === "flipkart") return parseFlipkartHtml(html, url);
    return parseMeeshoHtml(html, url);
  } catch {
    return null; // CORS / network — generic chain + manual fields take over
  }
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
      commerceRating: ld.rating ?? null,
      commerceReviews: ld.reviews ?? null,
      commerceSeller: ld.seller || null,
    };
  } catch {
    return null;
  }
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

import { getWorkerBaseUrl, getYouTubeWorkerUrl } from "@/lib/config";

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

/**
 * Fetch a link and build a preview. Tweet/X status URLs go through the
 * no-auth oEmbed endpoint first; everything else tries raw HTML, then the
 * `r.jina.ai` reader proxy. On platforms/hosts where CORS blocks direct
 * fetches (common on web), we fall through to the next source.
 */
export async function fetchLinkPreview(input: string): Promise<LinkPreview> {
  const url = normalizeUrl(input);
  if (!url) {
    throw new Error('Please enter a valid URL');
  }

  if (isTweetUrl(url)) {
    const tweet = await fetchTweetPreview(url);
    if (tweet) return tweet;
    // oEmbed unreachable — still flag as tweet so the UI auto-switches
    // template and the user can fill details manually.
    return tweetFallback(url);
  }

  if (isYouTubeUrl(url)) {
    const yt = await fetchYouTubePreview(url);
    if (yt) return yt;
    return youtubeFallback(url);
  }

  if (isTikTokUrl(url)) {
    const tt = await fetchTikTokPreview(url);
    if (tt) return tt;
    return tiktokFallback(url);
  }

  if (isTwitchUrl(url)) {
    const tw = await fetchTwitchPreview(url);
    if (tw) return tw;
    // No worker/creds — still flag as Twitch so the UI auto-switches
    // template and the user can fill details manually.
    return twitchFallback(url);
  }

  if (isRedditUrl(url)) {
    const rd = await fetchRedditPreview(url);
    if (rd) return rd;
    return redditFallback(url);
  }

  if (isSpotifyUrl(url)) {
    const sp = await fetchSpotifyPreview(url);
    if (sp) return sp;
    return spotifyFallback(url);
  }

  if (isGitHubUrl(url)) {
    const gh = await fetchGitHubPreview(url);
    if (gh) return gh;
    return githubFallback(url);
  }

  if (isEbayUrl(url)) {
    const eb = await fetchEbayPreview(url);
    if (eb) return eb;
    // fall through to the generic chain; withCommerce() still flags it
  }

  // Amazon / Flipkart / Meesho: best-effort PDP parse, else generic + manual.
  const store = commerceStoreFromUrl(url);
  if (store === "amazon" || store === "flipkart" || store === "meesho") {
    const mp = await fetchMarketplacePreview(url, store);
    if (mp) return mp;
    // fall through to the generic chain; withCommerce() still flags it
  }

  let html = '';
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes('<')) html = text;
    }
  } catch {
    // CORS / network error, fall through to proxy
  }

  if (html) {
    return withCommerce(parseOpenGraph(html, url), url);
  }

  const proxy = `https://r.jina.ai/${url}`;
  try {
    const res = await fetch(proxy);
    if (!res.ok) throw new Error();
    const text = await res.text();
    if (text) {
      return withCommerce(parseMarkdown(text, url), url);
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
    const og = getMeta('property', 'og:image') || getMeta('name', 'twitter:image');
    if (og) return resolveUrl(og, url);
    const tag = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    return tag ? resolveUrl(tag[1], url) : null;
  };

  const getSiteName = (): string | null => {
    return getMeta('property', 'og:site_name');
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
    url,
    title,
    description,
    image: getImage(),
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
    ...platformDefaults(),
  };
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
