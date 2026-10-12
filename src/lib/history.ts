import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

import type { LinkPreview } from "./link-preview";

const STORAGE_KEY = "linksnap:history:v1";

/** A saved generation: the fetched preview plus when the user generated it. */
export type HistoryItem = LinkPreview & { generatedAt: number };

let items: HistoryItem[] = [];
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function isValidHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.url === "string" && typeof o.generatedAt === "number";
}

/**
 * Load persisted history into memory. Rendered-app startup gates on this in the
 * root layout; `useHistory` also kicks it off as a safety net.
 */
export async function hydrateHistory(): Promise<void> {
  if (hydrated) return;
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            items = parsed.filter(isValidHistoryItem);
          }
        }
      } catch {
        // Corrupt/missing data — start empty.
      }
      hydrated = true;
      emit();
    })();
  }
  return hydrationPromise;
}

function persist() {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {
    // Quota / I/O errors are non-fatal; in-memory list still works this session.
  });
}

/**
 * Prepend a fetched preview (deduped by URL). Older entries are never pruned —
 * the store keeps everything until the user deletes it.
 */
export function addHistoryItem(item: LinkPreview) {
  const stamped: HistoryItem = { ...item, generatedAt: Date.now() };
  items = [stamped, ...items.filter((i) => i.url !== stamped.url)];
  emit();
  persist();
}

/** Remove a single saved generation by URL. */
export function deleteHistoryItem(url: string) {
  const before = items.length;
  items = items.filter((i) => i.url !== url);
  if (items.length !== before) {
    emit();
    persist();
  }
}

export function clearHistory() {
  if (items.length === 0) return;
  items = [];
  hydrated = true;
  emit();
  void AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}

/** Live history list for the home + history screens. Updates across navigation. */
export function useHistory(): HistoryItem[] {
  useEffect(() => {
    void hydrateHistory();
  }, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => items,
  );
}