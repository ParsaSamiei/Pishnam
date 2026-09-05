import type { AppLocale } from "./i18n/routing";

// Mirrors `enum AchievementScope` in prisma/schema.prisma.
export const ACHIEVEMENT_SCOPES = ["INTERNATIONAL", "NATIONAL"] as const;
export type AchievementScopeValue = (typeof ACHIEVEMENT_SCOPES)[number];

export const ACHIEVEMENT_SCOPE_LABELS: Record<AppLocale, Record<AchievementScopeValue, string>> = {
  fa: {
    INTERNATIONAL: "جهانی",
    NATIONAL: "کشوری",
  },
  en: {
    INTERNATIONAL: "International",
    NATIONAL: "National",
  },
};

export function isAchievementScope(value: string | undefined): value is AchievementScopeValue {
  return Boolean(value) && (ACHIEVEMENT_SCOPES as readonly string[]).includes(value as string);
}
