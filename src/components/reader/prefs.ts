"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reader preferences remembered in localStorage.
 * Every storage access is wrapped in try/catch and mirrored in memory, so the reader keeps working
 * (for the current visit) in private windows or when storage is blocked.
 */

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    // Storage unavailable: fall back to the in-memory copy.
  }
  return memory.get(key) ?? null;
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice lasts for this visit only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * A string preference restricted to `allowed` values. The server render (and hydration) use
 * `fallback`; the stored value takes over right after hydration.
 */
export function usePreference<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const getSnapshot = () => {
    const value = read(key);
    return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
  };
  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);
  const set = useCallback((next: T) => write(key, next), [key]);
  return [value, set] as const;
}
