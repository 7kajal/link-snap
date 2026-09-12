export type Palette = {
  hue: number;
  from: string;
  to: string;
  accent: string;
  soft: string;
};

function hashString(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^www\./, "").split("/")[0];
  }
}

/**
 * Derive a deterministic brand palette from any string (domain, site name, or
 * URL). The same input always yields the same gradient/accent. Zero network.
 */
export function getPalette(key: string): Palette {
  const hue = hashString(key) % 360;
  const from = `hsl(${hue}, 62%, 26%)`;
  const to = `hsl(${(hue + 42) % 360}, 72%, 11%)`;
  const accent = `hsl(${(hue + 12) % 360}, 90%, 58%)`;
  const soft = `hsla(${(hue + 12) % 360}, 85%, 70%, 0.16)`;
  return { hue, from, to, accent, soft };
}

export function getUrlSub(text: string): string {
  return text
    .replace(/^#/, "")
    .replace(/\s+/g, "")
    .charAt(0)
    .toUpperCase();
}

export type Hsv = { h: number; s: number; v: number };

/** HSV (h 0-360, s/v 0-1) → #RRGGBB. */
export function hsvToHex(h: number, s: number, v: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.min(1, Math.max(0, s));
  const vv = Math.min(1, Math.max(0, v));
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** #RGB / #RRGGBB (with or without #) → HSV, or null when invalid. */
export function hexToHsv(hex: string): Hsv | null {
  let s = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    s = s
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const b = parseInt(s.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 120 + 60 * ((b - r) / d);
    else h = 240 + 60 * ((r - g) / d);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}