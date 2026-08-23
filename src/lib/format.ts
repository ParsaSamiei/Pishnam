import type { AppLocale } from "./i18n/routing";

/**
 * Formats a date for display, using the Persian (Jalali) calendar for the
 * `fa` locale via the built-in `fa-IR-u-ca-persian` Intl extension (no extra
 * dependency needed) and the Gregorian calendar for `en`.
 */
export function formatDate(date: Date, locale: AppLocale): string {
  const intlLocale = locale === "fa" ? "fa-IR-u-ca-persian" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Weekday names indexed 0-6 matching ClassSession.weekday, Saturday-first
 * per the Iranian week (see prisma/schema.prisma comment). */
export const WEEKDAY_LABELS: Record<AppLocale, string[]> = {
  fa: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
  en: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
};

export function formatWeekday(weekday: number, locale: AppLocale): string {
  return WEEKDAY_LABELS[locale][weekday] ?? "";
}

/** Shared by every download-center listing (flat resources + software releases). */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}
