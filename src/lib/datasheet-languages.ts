import type { AppLocale } from "./i18n/routing";

export const DATASHEET_LANGUAGES = [
  "arduino",
  "c",
  "cpp",
  "python",
  "javascript",
  "bash",
  "other",
] as const;

export type DatasheetLanguage = (typeof DATASHEET_LANGUAGES)[number];

export const DATASHEET_LANGUAGE_LABELS: Record<
  DatasheetLanguage,
  { fa: string; en: string; silkscreen: string }
> = {
  arduino: { fa: "آردوینو", en: "Arduino", silkscreen: "ARDUINO" },
  c: { fa: "C", en: "C", silkscreen: "C" },
  cpp: { fa: "C++", en: "C++", silkscreen: "CPP" },
  python: { fa: "پایتون", en: "Python", silkscreen: "PYTHON" },
  javascript: { fa: "جاوااسکریپت", en: "JavaScript", silkscreen: "JS" },
  bash: { fa: "شل", en: "Bash", silkscreen: "BASH" },
  other: { fa: "سایر", en: "Other", silkscreen: "CODE" },
};

export function isDatasheetLanguage(value: string): value is DatasheetLanguage {
  return (DATASHEET_LANGUAGES as readonly string[]).includes(value);
}

export function datasheetLanguageLabel(value: string, locale: AppLocale): string {
  if (!isDatasheetLanguage(value)) return value;
  return locale === "fa"
    ? DATASHEET_LANGUAGE_LABELS[value].fa
    : DATASHEET_LANGUAGE_LABELS[value].en;
}

export function datasheetLanguageSilkscreen(value: string): string {
  if (!isDatasheetLanguage(value)) return value.toUpperCase();
  return DATASHEET_LANGUAGE_LABELS[value].silkscreen;
}
