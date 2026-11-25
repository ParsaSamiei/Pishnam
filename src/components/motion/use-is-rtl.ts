"use client";

import { useLocale } from "next-intl";
import { localeDirection, type AppLocale } from "@/lib/i18n/routing";

/**
 * True when the active locale reads right-to-left. Motion animates the
 * physical `x` axis, so the horizontal primitives need this to mirror
 * correctly for Persian -- CSS logical properties can't help there.
 */
export function useIsRtl() {
  const locale = useLocale();
  return localeDirection[locale as AppLocale] === "rtl";
}
