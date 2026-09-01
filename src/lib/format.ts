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

/** Team member collaboration start, localized for the public team page. */
export function formatCollaborationStartLabel(date: Date, locale: AppLocale): string {
  const formatted = formatDate(date, locale);
  return locale === "fa" ? `شروع همکاری: ${formatted}` : `Collaboration since ${formatted}`;
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

/** File extensions allowed in the download center (see upload-policies.ts). */
const DIRECT_DOWNLOAD_EXTENSION =
  /\.(zip|rar|7z|tar|gz|bz2|xz|dmg|exe|apk|pdf|epub|txt|jpe?g|png)$/i;

/**
 * True when the URL points at a downloadable file rather than a web page.
 * Used for CTA copy ("Download" vs "Visit") on software release rows.
 */
export function isDirectDownloadLink(fileUrl: string, source?: "HOSTED" | "EXTERNAL"): boolean {
  if (source === "HOSTED" || fileUrl.startsWith("/")) return true;
  const path = fileUrl.split(/[?#]/)[0] ?? fileUrl;
  return DIRECT_DOWNLOAD_EXTENSION.test(path);
}

/** Shared by every download-center listing (flat resources + software releases). */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}
