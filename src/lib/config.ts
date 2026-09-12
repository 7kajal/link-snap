import Constants from "expo-constants";

/**
 * Base URL of the deployed Cloudflare Worker that proxies API calls
 * (YouTube Data API + Twitch Helix) to keep keys server-side.
 * Set via app.json `expo.extra.ytWorkerUrl`.
 * Empty string = worker layer skipped; the app falls back to scrape → oEmbed
 * → manual fields.
 */
export function getWorkerBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { ytWorkerUrl?: unknown };
  const url = typeof extra.ytWorkerUrl === "string" ? extra.ytWorkerUrl.trim() : "";
  return url.replace(/\/$/, "");
}

/** Kept for existing call sites (same Worker serves every route). */
export function getYouTubeWorkerUrl(): string {
  return getWorkerBaseUrl();
}

/**
 * Facebook App ID required by Meta's Sharing-to-Stories API (Instagram and
 * Facebook Stories) since 2023. Set via app.json `expo.extra.fbAppId`.
 * Public identifier, safe to ship in the app. Empty string = story targets
 * fall back to the system share sheet.
 */
export function getFbAppId(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { fbAppId?: unknown };
  return typeof extra.fbAppId === "string" ? extra.fbAppId.trim() : "";
}
