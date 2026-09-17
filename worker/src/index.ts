/**
 * LinkCard metadata proxy (page metadata, images, YouTube + Twitch).
 *
 * Holds API keys as encrypted Worker secrets so they never ship in the app:
 *
 *   GET /yt?url=<youtube-watch|shorts|live|youtu.be-url>
 *     → trimmed YouTube Data API v3 payload for card rendering.
 *
 *   GET /twitch?url=<twitch-channel|clip|video-url>
 *     → trimmed Twitch Helix payload (live status, clips, VODs, profiles).
 *
 * Deploy (needs your Cloudflare account + API keys):
 *   1. cd worker && npm install
 *   2. npx wrangler login
 *   3. npx wrangler secret put YT_API_KEY        # Google API key (YouTube Data API v3)
 *   4. npx wrangler secret put TWITCH_CLIENT_ID  # Twitch app client ID (dev.twitch.tv)
 *   5. npx wrangler secret put TWITCH_CLIENT_SECRET
 *   6. npx wrangler deploy
 *   7. Copy the workers.dev URL into the app's app.json:
 *      expo.extra.ytWorkerUrl = "https://<name>.<subdomain>.workers.dev"
 *      (one Worker serves both routes; either secret may be omitted to
 *      disable that route — the app falls back gracefully)
 */

type Env = {
  YT_API_KEY: string;
  TWITCH_CLIENT_ID?: string;
  TWITCH_CLIENT_SECRET?: string;
};

type YouTubeKind = "video" | "short" | "live" | "premiere";

type TwitchKind = "live" | "clip" | "video" | "channel";

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

// Cheap per-isolate throttle (approximate; isolates are not shared globally).
// Tune or remove as you like — this only blunts casual abuse, since strict
// limiting needs KV or Rate Limiting rules.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();
const MAX_REDIRECTS = 8;
const MAX_HTML_BYTES = 2_000_000;
const MAX_IMAGE_BYTES = 10_000_000;
const UPSTREAM_TIMEOUT_MS = 12_000;

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "::1" || host === "0.0.0.0" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe8") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb")) return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const [a, b] = ipv4.slice(1).map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function safeTarget(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || isPrivateHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchPublicUrl(raw: string, accept: string): Promise<{ response: Response; url: string } | null> {
  let target = safeTarget(raw);
  if (!target) return null;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(target, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: accept,
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent": "Mozilla/5.0 (compatible; LinkCardBot/1.0; +https://github.com/)",
        },
      });
    } finally {
      clearTimeout(timeout);
    }
    if (response.status < 300 || response.status >= 400) return { response, url: target.toString() };
    const location = response.headers.get("Location");
    if (!location || redirects === MAX_REDIRECTS) return null;
    target = safeTarget(new URL(location, target).toString());
    if (!target) return null;
  }
  return null;
}

function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
}

function json(data: unknown, status = 200, cacheTtl = 0): Response {
  const headers = corsHeaders();
  if (cacheTtl > 0) headers["Cache-Control"] = `public, max-age=${cacheTtl}`;
  return new Response(JSON.stringify(data), { status, headers });
}

/** Extract the 11-char video id + a URL-hint kind from supported URL shapes. */
function parseYouTubeUrl(raw: string): { id: string; urlKind: "short" | "live" | "video" } | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  const path = u.pathname;

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0] || "";
    return VIDEO_ID_RE.test(id) ? { id, urlKind: "video" } : null;
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const short = path.match(/^\/shorts\/([^/?#]+)/);
    if (short && VIDEO_ID_RE.test(short[1])) return { id: short[1], urlKind: "short" };
    const live = path.match(/^\/live\/([^/?#]+)/);
    if (live && VIDEO_ID_RE.test(live[1])) return { id: live[1], urlKind: "live" };
    const embed = path.match(/^\/(?:embed|v)\/([^/?#]+)/);
    if (embed && VIDEO_ID_RE.test(embed[1])) return { id: embed[1], urlKind: "video" };
    if (path === "/watch") {
      const id = u.searchParams.get("v") || "";
      return VIDEO_ID_RE.test(id) ? { id, urlKind: "video" } : null;
    }
  }
  return null;
}

/** ISO 8601 duration (PT1H2M3S) → seconds. */
function isoDurationToSec(iso: string): number | null {
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const d = Number(m[1] || 0);
  const h = Number(m[2] || 0);
  const min = Number(m[3] || 0);
  const s = Number(m[4] || 0);
  if (!iso.includes("T") && d === 0) return null;
  return d * 86400 + h * 3600 + min * 60 + s;
}

function pickThumb(thumbs: Record<string, { url?: string }>): string | null {
  return (
    thumbs?.maxres?.url || thumbs?.standard?.url || thumbs?.high?.url || thumbs?.medium?.url || thumbs?.default?.url || null
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const reqUrl = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (throttled(ip)) {
      return json({ error: "rate_limited" }, 429);
    }

    if (reqUrl.pathname === "/yt") {
      return handleYouTube(reqUrl, env);
    }
    if (reqUrl.pathname === "/twitch") {
      return handleTwitch(reqUrl, env);
    }
    if (reqUrl.pathname === "/resolve") {
      return handleResolve(reqUrl);
    }
    if (reqUrl.pathname === "/image") {
      return handleImage(reqUrl);
    }
    return json({ error: "not_found" }, 404);
  },
};

async function handleResolve(reqUrl: URL): Promise<Response> {
  const target = reqUrl.searchParams.get("url") || "";
  try {
    const fetched = await fetchPublicUrl(target, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1");
    if (!fetched) return json({ error: "invalid_url" }, 400);
    if (!fetched.response.ok) return json({ error: "upstream_error", status: fetched.response.status }, 502);
    const type = fetched.response.headers.get("Content-Type") || "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
      return json({ error: "not_html" }, 415);
    }
    const declared = Number(fetched.response.headers.get("Content-Length") || 0);
    if (declared > MAX_HTML_BYTES) return json({ error: "page_too_large" }, 413);
    const html = await fetched.response.text();
    if (new TextEncoder().encode(html).byteLength > MAX_HTML_BYTES) return json({ error: "page_too_large" }, 413);
    return json({ url: fetched.url, html }, 200, 300);
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  }
}

async function handleImage(reqUrl: URL): Promise<Response> {
  const target = reqUrl.searchParams.get("url") || "";
  try {
    const fetched = await fetchPublicUrl(target, "image/avif,image/webp,image/*,*/*;q=0.1");
    if (!fetched) return json({ error: "invalid_url" }, 400);
    if (!fetched.response.ok) return json({ error: "upstream_error", status: fetched.response.status }, 502);
    const type = fetched.response.headers.get("Content-Type") || "";
    if (!type.toLowerCase().startsWith("image/")) return json({ error: "not_image" }, 415);
    const declared = Number(fetched.response.headers.get("Content-Length") || 0);
    if (declared > MAX_IMAGE_BYTES) return json({ error: "image_too_large" }, 413);
    const body = await fetched.response.arrayBuffer();
    if (body.byteLength > MAX_IMAGE_BYTES) return json({ error: "image_too_large" }, 413);
    return new Response(body, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
        "Content-Type": type,
      },
    });
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  }
}

async function handleYouTube(reqUrl: URL, env: Env): Promise<Response> {
    if (!env.YT_API_KEY) {
      return json({ error: "missing_api_key" }, 500);
    }

    const target = reqUrl.searchParams.get("url") || "";
    const parsed = parseYouTubeUrl(target);
    if (!parsed) {
      return json({ error: "invalid_youtube_url" }, 400);
    }

    const api =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,contentDetails,statistics,liveStreamingDetails` +
      `&id=${parsed.id}&key=${encodeURIComponent(env.YT_API_KEY)}`;

    let apiRes: Response;
    try {
      apiRes = await fetch(api);
    } catch {
      return json({ error: "upstream_unreachable" }, 502);
    }
    if (apiRes.status === 403) return json({ error: "quota_or_key" }, 502);
    if (!apiRes.ok) return json({ error: "upstream_error" }, 502);

    const data = (await apiRes.json()) as {
      items?: Array<{
        snippet?: {
          title?: string;
          channelTitle?: string;
          channelId?: string;
          publishedAt?: string;
          thumbnails?: Record<string, { url?: string }>;
          liveBroadcastContent?: string;
        };
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string; likeCount?: string };
        liveStreamingDetails?: {
          scheduledStartTime?: string;
          actualStartTime?: string;
          concurrentViewers?: string;
        };
      }>;
    };
    const item = data.items?.[0];
    if (!item) {
      return json({ error: "video_not_found" }, 404);
    }

    const snippet = item.snippet || {};
    const live = snippet.liveBroadcastContent || "none";
    const liveDetails = item.liveStreamingDetails || {};

    let kind: YouTubeKind = "video";
    if (parsed.urlKind === "short") kind = "short";
    else if (live === "live") kind = "live";
    else if (live === "upcoming") kind = "premiere";

    const durationIso = item.contentDetails?.duration || null;
    const payload = {
      id: parsed.id,
      kind,
      title: snippet.title || "",
      channelTitle: snippet.channelTitle || "",
      channelId: snippet.channelId || "",
      publishedAt: snippet.publishedAt || null,
      thumbnail: pickThumb(snippet.thumbnails || {}),
      durationIso,
      durationSec: durationIso ? isoDurationToSec(durationIso) : null,
      viewCount: item.statistics?.viewCount ? Number(item.statistics.viewCount) : null,
      likeCount: item.statistics?.likeCount ? Number(item.statistics.likeCount) : null,
      scheduledStartTime: liveDetails.scheduledStartTime || null,
      concurrentViewers: liveDetails.concurrentViewers ? Number(liveDetails.concurrentViewers) : null,
    };

    // Cache successes at the edge for an hour (repeat cards cost zero quota).
    return json(payload, 200, 3600);
}

/* ---------------- Twitch (Helix, app-token server-side) ---------------- */

type TwitchTarget =
  | { kind: "clip"; slug: string }
  | { kind: "video"; id: string }
  | { kind: "channel"; login: string };

const TWITCH_LOGIN_RE = /^[a-zA-Z0-9_]{1,25}$/;

function parseTwitchUrl(raw: string): TwitchTarget | null {
  let u: URL;
  try {
    u = new URL(raw);
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

/** Per-isolate app-token cache (Helix app tokens live ~60 days; refresh early). */
let twToken = { token: "", exp: 0 };

async function twitchAppToken(env: Env): Promise<string | null> {
  if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) return null;
  if (twToken.token && Date.now() < twToken.exp - 300_000) return twToken.token;
  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        `client_id=${encodeURIComponent(env.TWITCH_CLIENT_ID)}` +
        `&client_secret=${encodeURIComponent(env.TWITCH_CLIENT_SECRET)}` +
        `&grant_type=client_credentials`,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    twToken = {
      token: data.access_token,
      exp: Date.now() + (data.expires_in || 3600) * 1000,
    };
    return twToken.token;
  } catch {
    return null;
  }
}

async function helix<T>(path: string, env: Env, token: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": env.TWITCH_CLIENT_ID || "",
    },
  });
  let data = null;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null as T;
  }
  return { status: res.status, data };
}

/** "2h14m30s" → seconds. */
function twitchDurationToSec(d: string): number | null {
  const m = d.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

function twitchThumb(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace("{width}x{height}", "1280x720").replace("%{width}x%{height}", "1280x720");
}

async function twitchGameName(gameId: string | undefined, env: Env, token: string): Promise<string | null> {
  if (!gameId) return null;
  try {
    const r = await helix<{ data?: Array<{ name?: string }> }>(
      `/games?id=${encodeURIComponent(gameId)}`,
      env,
      token,
    );
    return r.data?.data?.[0]?.name || null;
  } catch {
    return null;
  }
}

async function handleTwitch(reqUrl: URL, env: Env): Promise<Response> {
  if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
    return json({ error: "missing_twitch_creds" }, 500);
  }
  const target = parseTwitchUrl(reqUrl.searchParams.get("url") || "");
  if (!target) {
    return json({ error: "invalid_twitch_url" }, 400);
  }

  let token = await twitchAppToken(env);
  if (!token) {
    return json({ error: "twitch_auth_failed" }, 502);
  }

  // Refresh once on 401 (rotated secret / expired cache), then proceed.
  let authed = async <T>(path: string): Promise<{ status: number; data: T }> => {
    let r = await helix<T>(path, env, token as string);
    if (r.status === 401) {
      twToken = { token: "", exp: 0 };
      const fresh = await twitchAppToken(env);
      if (!fresh) return { status: 401, data: null as T };
      token = fresh;
      r = await helix<T>(path, env, token);
    }
    return r;
  };

  try {
    if (target.kind === "clip") {
      const r = await authed<{ data?: Array<Record<string, unknown>> }>(
        `/clips?id=${encodeURIComponent(target.slug)}`,
      );
      if (r.status === 401) return json({ error: "invalid_twitch_creds" }, 502);
      const clip = r.data?.data?.[0];
      if (!clip) return json({ error: "clip_not_found" }, 404);
      const gameId = typeof clip.game_id === "string" ? clip.game_id : undefined;
      return json(
        {
          kind: "clip",
          id: clip.id || target.slug,
          title: clip.title || "",
          streamerName: clip.broadcaster_name || "",
          creatorName: clip.creator_name || "",
          gameName: await twitchGameName(gameId, env, token),
          thumbnail: twitchThumb(typeof clip.thumbnail_url === "string" ? clip.thumbnail_url : undefined),
          viewCount: typeof clip.view_count === "number" ? clip.view_count : null,
          durationSec: typeof clip.duration === "number" ? Math.round(clip.duration) : null,
          createdAt: clip.created_at || null,
          url: clip.url || null,
        },
        200,
        3600,
      );
    }

    if (target.kind === "video") {
      const r = await authed<{ data?: Array<Record<string, unknown>> }>(
        `/videos?id=${encodeURIComponent(target.id)}`,
      );
      if (r.status === 401) return json({ error: "invalid_twitch_creds" }, 502);
      const video = r.data?.data?.[0];
      if (!video) return json({ error: "video_not_found" }, 404);
      const gameId = typeof video.game_id === "string" ? video.game_id : undefined;
      const durStr = typeof video.duration === "string" ? video.duration : "";
      return json(
        {
          kind: "video",
          id: video.id || target.id,
          title: video.title || "",
          streamerName: video.user_name || "",
          streamerLogin: video.user_login || "",
          gameName: await twitchGameName(gameId, env, token),
          thumbnail: twitchThumb(typeof video.thumbnail_url === "string" ? video.thumbnail_url : undefined),
          viewCount: typeof video.view_count === "number" ? video.view_count : null,
          durationSec: durStr ? twitchDurationToSec(durStr) : null,
          createdAt: video.created_at || video.published_at || null,
          url: video.url || null,
        },
        200,
        3600,
      );
    }

    // Channel: resolve login → user → live stream check.
    const u = await authed<{ data?: Array<Record<string, unknown>> }>(
      `/users?login=${encodeURIComponent(target.login)}`,
    );
    if (u.status === 401) return json({ error: "invalid_twitch_creds" }, 502);
    const user = u.data?.data?.[0];
    if (!user || typeof user.id !== "string") return json({ error: "channel_not_found" }, 404);

    const s = await authed<{ data?: Array<Record<string, unknown>> }>(
      `/streams?user_id=${encodeURIComponent(user.id)}`,
    );
    const stream = s.data?.data?.[0];
    const profileImage = typeof user.profile_image_url === "string" ? user.profile_image_url : null;
    if (stream) {
      return json(
        {
          kind: "live",
          id: stream.id || user.id,
          title: stream.title || "",
          streamerName: stream.user_name || user.display_name || target.login,
          streamerLogin: stream.user_login || user.login || target.login,
          profileImage,
          gameName: (typeof stream.game_name === "string" && stream.game_name) || null,
          thumbnail: twitchThumb(typeof stream.thumbnail_url === "string" ? stream.thumbnail_url : undefined),
          viewerCount: typeof stream.viewer_count === "number" ? stream.viewer_count : null,
          startedAt: stream.started_at || null,
        },
        200,
        60, // live counts go stale fast
      );
    }
    return json(
      {
        kind: "channel",
        id: user.id,
        title: "",
        streamerName: user.display_name || user.login || target.login,
        streamerLogin: user.login || target.login,
        profileImage,
        gameName: null,
        thumbnail:
          typeof user.offline_image_url === "string" && user.offline_image_url
            ? user.offline_image_url
            : null,
        viewerCount: null,
        startedAt: null,
      },
      200,
      3600,
    );
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  }
}
