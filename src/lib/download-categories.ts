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

// Competition posters used to be flat DownloadResource rows (POSTERS). They
// now live under Competition → League → PosterCategory → CompetitionPoster
// so admins can manage categories per competition and league. Kept as a
// separate tile constant for the same reason as SOFTWARE_DOWNLOAD_TILE.
export const POSTERS_DOWNLOAD_TILE = {
  slug: "posters",
  icon: Trophy,
  labelFa: "پوستر مسابقات رباتیک",
  labelEn: "Competition Posters",
} as const;

// Datasheets used to be a flat DownloadResource category. They now have their
// own DatasheetPart model (family + optional variants, each with a page of
// docs/video/photos/code) -- see src/app/[locale]/downloads/datasheets/.
export const DATASHEETS_DOWNLOAD_TILE = {
  slug: "datasheets",
  value: "DATASHEETS",
  icon: FileText,
  labelFa: "دیتاشیت و مستندات فنی",
  labelEn: "Datasheets & Docs",
} as const;

// Mirrors the remaining flat values of `enum DownloadCategory` in
// prisma/schema.prisma. URL slugs are kebab-case per
// docs/02-information-architecture.md ("/downloads/[category]").
export const DOWNLOAD_CATEGORIES = [
  {
    slug: "books",
    value: "BOOKS",
    icon: BookOpen,
    labelFa: "کتاب و منابع آموزشی",
    labelEn: "Books & Resources",
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

/** Leftover DATASHEETS rows in /admin/downloads until they are deleted. */
export const ADMIN_DOWNLOAD_CATEGORIES = [
  DATASHEETS_DOWNLOAD_TILE,
  ...DOWNLOAD_CATEGORIES,
] as const;

export type DownloadCategorySlug = (typeof DOWNLOAD_CATEGORIES)[number]["slug"];

export function getDownloadCategory(slug: string) {
  return DOWNLOAD_CATEGORIES.find((category) => category.slug === slug);
}

export function downloadCategoryLabel(slug: string, locale: AppLocale): string {
  const category =
    getDownloadCategory(slug) ??
    ADMIN_DOWNLOAD_CATEGORIES.find((entry) => entry.slug === slug || entry.value === slug);
  if (!category) return slug;
  return locale === "fa" ? category.labelFa : category.labelEn;
}
