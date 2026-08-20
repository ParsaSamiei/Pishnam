import type { LucideIcon } from "lucide-react";
import { Code2, FileText, BookOpen, Trophy, Boxes } from "lucide-react";
import type { AppLocale } from "./i18n/routing";

// Mirrors `enum DownloadCategory` in prisma/schema.prisma. URL slugs are
// kebab-case per docs/02-information-architecture.md
// ("/downloads/[category]").
export const DOWNLOAD_CATEGORIES = [
  {
    slug: "software",
    value: "SOFTWARE",
    icon: Code2,
    labelFa: "نرم‌افزار و افزونه‌ها",
    labelEn: "Software & Plugins",
  },
  {
    slug: "datasheets",
    value: "DATASHEETS",
    icon: FileText,
    labelFa: "دیتاشیت و مستندات فنی",
    labelEn: "Datasheets & Docs",
  },
  {
    slug: "books",
    value: "BOOKS",
    icon: BookOpen,
    labelFa: "کتاب و منابع آموزشی",
    labelEn: "Books & Resources",
  },
  {
    slug: "posters",
    value: "POSTERS",
    icon: Trophy,
    labelFa: "پوستر مسابقات رباتیک",
    labelEn: "Competition Posters",
  },
  {
    slug: "component-libraries",
    value: "COMPONENT_LIBRARIES",
    icon: Boxes,
    labelFa: "کتابخانه قطعات CAD",
    labelEn: "CAD Part Libraries",
  },
] as const satisfies {
  slug: string;
  value: string;
  icon: LucideIcon;
  labelFa: string;
  labelEn: string;
}[];

export type DownloadCategorySlug = (typeof DOWNLOAD_CATEGORIES)[number]["slug"];

export function getDownloadCategory(slug: string) {
  return DOWNLOAD_CATEGORIES.find((category) => category.slug === slug);
}

export function downloadCategoryLabel(slug: string, locale: AppLocale): string {
  const category = getDownloadCategory(slug);
  if (!category) return slug;
  return locale === "fa" ? category.labelFa : category.labelEn;
}
