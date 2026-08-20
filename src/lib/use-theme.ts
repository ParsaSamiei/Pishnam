"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
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
    window.localStorage.setItem("pishnam-theme", next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
