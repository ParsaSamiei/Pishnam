"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { applyResolvedTheme } from "@/lib/use-theme";

/**
 * Re-asserts `data-theme` on `<html>` after soft navigations. React 19 can
 * strip imperative attributes off the singleton `<html>` node when the root
 * layout re-renders (locale switches, not-found boundaries, etc.); the inline
 * theme-script's MutationObserver covers removal, and this runs in
 * useLayoutEffect before paint on every pathname change as a second line of
 * defense -- which is what not-found needed in practice.
 */
export function ThemeReconciler() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    applyResolvedTheme();
  }, [pathname]);

  return null;
}
