import type { AppLocale } from "./routing";

/**
 * Selects between parallel `xFa` / `xEn` fields (used by simpler content
 * models per docs/04-database-schema.md) based on the active locale.
 */
export function pickLocaleField<T>(fa: T, en: T, locale: AppLocale): T {
  return locale === "fa" ? fa : en;
}
