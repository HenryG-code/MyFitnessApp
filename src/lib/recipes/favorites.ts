"use client";

import { useSyncExternalStore } from "react";

const storageKey = "logfit-recipe-favorites-v1";
const changeEvent = "logfit-favorites-changed";

const emptySet: ReadonlySet<string> = new Set();
let cachedFavorites: ReadonlySet<string> | null = null;

function readFavorites(): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((value) => typeof value === "string")
        : []
    );
  } catch {
    return new Set();
  }
}

function getSnapshot(): ReadonlySet<string> {
  cachedFavorites ??= readFavorites();
  return cachedFavorites;
}

function getServerSnapshot(): ReadonlySet<string> {
  return emptySet;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(changeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(changeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/** Reactive saved-recipe slugs, shared across all recipe components. */
export function useFavoriteRecipes(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleFavoriteSlug(slug: string) {
  const next = new Set(getSnapshot());

  if (next.has(slug)) {
    next.delete(slug);
  } else {
    next.add(slug);
  }

  cachedFavorites = next;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...next]));
  } catch {
    // Storage unavailable — favourites stay session-only.
  }

  window.dispatchEvent(new Event(changeEvent));
}
