import type { SharePayload } from "expo-sharing";

const URL_RE = /https?:\/\/[^\s]+/g;

/** Pull the first web URL out of the raw payloads shared with the app. */
export function extractSharedUrl(payloads: SharePayload[]): string | null {
  for (const payload of payloads) {
    const value = payload.value.trim();
    if (!value) continue;

    if (payload.shareType === "url") {
      return normalizeUrl(value);
    }

    const match = value.match(URL_RE);
    if (match) return normalizeUrl(match[0]);
  }
  return null;
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/[),.:"']+$/, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null;
  }
  return trimmed;
}