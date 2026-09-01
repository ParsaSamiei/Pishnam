"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "pishnam-theme";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/**
 * The same resolution the inline theme-script performs, for the one case where
 * the attribute is not on the document yet. Kept in step with the `resolve()`
 * copy in components/layout/theme-script.tsx by hand -- that one has to be a
 * string in <head> to beat first paint, so it cannot import this.
 */
export function resolveTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage unavailable; fall through to the media query.
  }

  const mql =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  if (!mql || typeof mql.matches !== "boolean") return "dark";
  return mql.matches ? "dark" : "light";
}

/** Re-apply the resolved theme to `<html>`. Safe to call after soft navigations. */
export function applyResolvedTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolveTheme());
}

function getSnapshot(): Theme {
  const applied = document.documentElement.getAttribute("data-theme");
  if (applied === "light" || applied === "dark") return applied;

  // Missing attribute: resolve it the way the inline script does instead of
  // assuming dark. globals.css maps *no* attribute to the `:root` (light)
  // tokens, so a blind "dark" fallback made the toggle contradict the page it
  // was sitting on -- exactly the disagreement that showed up when React
  // stripped the attribute off <html> during a locale change.
  return resolveTheme();
}

// Matches theme-script.tsx's fallback so the very first client render (which
// React forces to equal the server snapshot, to avoid a hydration mismatch)
// lines up with what the server actually rendered.
function getServerSnapshot(): Theme {
  return "dark";
}

/**
 * Reads the live `data-theme` attribute set by the inline theme-script
 * (see theme-script.tsx) via useSyncExternalStore, rather than duplicating
 * it into local component state -- this keeps every consumer in sync
 * automatically (e.g. if the theme changes from somewhere else) and avoids
 * the SSR/client hydration mismatch that a plain useState+useEffect pairing
 * would need an extra render pass to paper over.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
