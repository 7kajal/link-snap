import { useSyncExternalStore } from "react";

import type { LinkPreview } from "./link-preview";

const MAX_ITEMS = 30;

let items: LinkPreview[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Prepend a fetched preview (deduped by URL). Called by the result screen. */
export function addHistoryItem(item: LinkPreview) {
  items = [item, ...items.filter((i) => i.url !== item.url)].slice(0, MAX_ITEMS);
  emit();
}

export function clearHistory() {
  items = [];
  emit();
}

/** Live history list for the home screen. Updates across navigation. */
export function useHistory(): LinkPreview[] {
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
