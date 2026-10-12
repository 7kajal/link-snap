import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

const PREFIX = "linksnap:setting:";
const DEBOUNCE_MS = 250;

/** In-memory cache of hydrated settings. Synchronous reads power lazy useState init. */
const cache = new Map<string, unknown>();
const writeTimers = new Map<string, ReturnType<typeof setTimeout>>();
let hydrationPromise: Promise<void> | null = null;

/**
 * Load every persisted setting into the in-memory cache.
 * Idempotent and safe to call more than once (rendering is gated on it in the
 * root layout, so screens can rely on `getSetting` returning hydrated values).
 */
export function hydrateSettings(): Promise<void> {
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const ourKeys = keys.filter((key) => key.startsWith(PREFIX));
        if (ourKeys.length === 0) return;
        const entries = await AsyncStorage.multiGet(ourKeys);
        for (const [storageKey, raw] of entries) {
          if (raw == null) continue;
          try {
            cache.set(storageKey.slice(PREFIX.length), JSON.parse(raw));
          } catch {
            // Corrupt entry — ignore, default wins.
          }
        }
      } catch {
        // Storage unavailable — defaults remain.
      }
    })();
  }
  return hydrationPromise;
}

/** Synchronous read from the hydrated cache (falls back when absent). */
export function getSetting<T>(key: string, fallback: T): T {
  return cache.has(key) ? (cache.get(key) as T) : fallback;
}

function toJson(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function persistKey(key: string, raw: string) {
  void AsyncStorage.setItem(PREFIX + key, raw).catch(() => {
    // Quota / I/O errors are non-fatal; the in-memory cache still serves reads.
  });
}

/**
 * Persist a setting immediately (updates the cache too).
 * Used by discrete user actions like the dark-mode toggle.
 */
export function setSetting(key: string, value: unknown): void {
  cache.set(key, value);
  const raw = toJson(value);
  if (raw == null) return;
  const existing = writeTimers.get(key);
  if (existing) {
    clearTimeout(existing);
    writeTimers.delete(key);
  }
  persistKey(key, raw);
}

function scheduleDebouncedWrite(key: string, raw: string) {
  const existing = writeTimers.get(key);
  if (existing) clearTimeout(existing);
  writeTimers.set(
    key,
    setTimeout(() => {
      writeTimers.delete(key);
      persistKey(key, raw);
    }, DEBOUNCE_MS),
  );
}

/**
 * useState drop-in that persists changes. Debounced so slider drags
 * (blur/vignette) don't hammer storage on every frame.
 * The key must be a stable literal (it is never swapped at runtime).
 */
export function usePersistedSetting<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => getSetting(key, fallback));

  const setter = useCallback(
    (next: SetStateAction<T>) => {
      setValue((prev) => {
        const resolved: T =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        cache.set(key, resolved);
        const raw = toJson(resolved);
        if (raw != null) scheduleDebouncedWrite(key, raw);
        return resolved;
      });
    },
    [key],
  );

  return [value, setter];
}