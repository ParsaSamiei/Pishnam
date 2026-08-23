import type { LucideIcon } from "lucide-react";
import { Code2, FileText, BookOpen, Trophy, Boxes } from "lucide-react";
import type { AppLocale } from "./i18n/routing";

// "Software & Plugins" used to be a value in `enum DownloadCategory` with a
// flat DownloadResource row per item. It now has its own SoftwareProduct /
// SoftwareRelease models (see prisma/schema.prisma) so each app/plugin can
// have a picture and its own page listing several platform-specific files --
// see src/app/[locale]/downloads/software/. This constant is kept separate
// from DOWNLOAD_CATEGORIES below (which now only covers the flat,
// single-file-per-item categories) purely for the public /downloads index
// tile, which still wants to list software first alongside the others.
export const SOFTWARE_DOWNLOAD_TILE = {
  slug: "software",
  icon: Code2,
  labelFa: "نرم‌افزار و افزونه‌ها",
  labelEn: "Software & Plugins",
} as const;

// Mirrors `enum DownloadCategory` in prisma/schema.prisma. URL slugs are
// kebab-case per docs/02-information-architecture.md
// ("/downloads/[category]").
export const DOWNLOAD_CATEGORIES = [
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
