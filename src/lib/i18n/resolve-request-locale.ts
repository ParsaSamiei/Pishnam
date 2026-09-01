import { headers } from "next/headers";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { routing, type AppLocale } from "./routing";

/** Infer locale from a pathname, respecting `localePrefix: "as-needed"`. */
export function localeFromPathname(pathname: string): AppLocale {
  const normalized = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  const first = normalized.split("/").filter(Boolean)[0];
  if (first && hasLocale(routing.locales, first)) {
    return first as AppLocale;
  }
  return routing.defaultLocale;
}

/**
 * Resolve the active locale for routes that do not receive `params` (e.g.
 * `not-found.tsx`). Prefer the rewritten pathname, then next-intl's request
 * locale, then the default.
 */
export async function resolveRequestLocale(): Promise<AppLocale> {
  const headerList = await headers();
  const pathHint =
    headerList.get("x-nextjs-rewritten-path") ??
    headerList.get("next-url") ??
    headerList.get("x-invoke-path") ??
    "";

  if (pathHint) {
    const pathname = pathHint.startsWith("http") ? new URL(pathHint).pathname : pathHint;
    return localeFromPathname(pathname);
  }

  const referer = headerList.get("referer");
  if (referer) {
    try {
      return localeFromPathname(new URL(referer).pathname);
    } catch {
      // Malformed referer -- fall through.
    }
  }

  const locale = await getLocale();
  if (hasLocale(routing.locales, locale)) {
    return locale as AppLocale;
  }

  return routing.defaultLocale;
}
