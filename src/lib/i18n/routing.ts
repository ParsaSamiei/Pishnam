import { defineRouting } from "next-intl/routing";

// URL structure per docs/07-seo-guidelines.md:
//   pishnam.com/       -> Persian (default, no prefix -- primary language)
//   pishnam.com/en/... -> English
export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "fa",
  localePrefix: "as-needed",
  localeDetection: false, // explicit locale in URL is the source of truth; no browser-based
  // auto-redirect, so a shared /courses/rescue-line link always shows fa
  // consistently regardless of visitor's browser language.
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirection: Record<AppLocale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
};
