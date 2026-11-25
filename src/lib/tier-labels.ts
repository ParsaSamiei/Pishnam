import type { AppLocale } from "./i18n/routing";

// Mirrors `enum Tier` in prisma/schema.prisma.
export const TIERS = ["ELEMENTARY", "MIDDLE", "HIGH_SCHOOL", "COMPETITIVE"] as const;
export type TierValue = (typeof TIERS)[number];

export const TIER_LABELS: Record<AppLocale, Record<TierValue, string>> = {
  fa: {
    ELEMENTARY: "ابتدایی",
    MIDDLE: "متوسطه اول",
    HIGH_SCHOOL: "متوسطه دوم",
    COMPETITIVE: "تیم مسابقات",
  },
  en: {
    ELEMENTARY: "Elementary",
    MIDDLE: "Middle School",
    HIGH_SCHOOL: "High School",
    COMPETITIVE: "Competitive Team",
  },
};
