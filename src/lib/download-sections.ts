import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  Code2,
  Download,
  FileArchive,
  FileText,
  FolderOpen,
  Trophy,
} from "lucide-react";
import type { DownloadSectionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "./i18n/routing";

export const BUILTIN_SECTION_TYPES = [
  "SOFTWARE",
  "POSTERS",
  "DATASHEETS",
  "BOOKS",
  "COMPONENT_LIBRARIES",
] as const satisfies readonly DownloadSectionType[];

export type BuiltinSectionType = (typeof BUILTIN_SECTION_TYPES)[number];

export const DOWNLOAD_SECTION_SLUGS: Record<BuiltinSectionType, string> = {
  SOFTWARE: "software",
  POSTERS: "posters",
  DATASHEETS: "datasheets",
  BOOKS: "books",
  COMPONENT_LIBRARIES: "component-libraries",
};

/** Slugs reserved for built-in routes — custom sections cannot reuse these. */
export const RESERVED_DOWNLOAD_SLUGS = new Set(Object.values(DOWNLOAD_SECTION_SLUGS));

export const DOWNLOAD_SECTION_TYPE_LABELS: Record<DownloadSectionType, { fa: string; en: string }> =
  {
    SOFTWARE: { fa: "نرم‌افزار و افزونه‌ها", en: "Software & Plugins" },
    POSTERS: { fa: "پوستر مسابقات", en: "Competition Posters" },
    DATASHEETS: { fa: "دیتاشیت و مستندات", en: "Datasheets & Docs" },
    BOOKS: { fa: "کتاب و منابع", en: "Books & Resources" },
    COMPONENT_LIBRARIES: { fa: "کتابخانه قطعات CAD", en: "CAD Part Libraries" },
    CUSTOM: { fa: "بخش سفارشی", en: "Custom Section" },
  };

export const DOWNLOAD_SECTION_ICONS: {
  key: string;
  icon: LucideIcon;
  label: string;
}[] = [
  { key: "code-2", icon: Code2, label: "نرم‌افزار" },
  { key: "trophy", icon: Trophy, label: "مسابقات" },
  { key: "file-text", icon: FileText, label: "مستندات" },
  { key: "book-open", icon: BookOpen, label: "کتاب" },
  { key: "boxes", icon: Boxes, label: "قطعات CAD" },
  { key: "download", icon: Download, label: "دانلود" },
  { key: "folder-open", icon: FolderOpen, label: "پوشه" },
  { key: "file-archive", icon: FileArchive, label: "آرشیو" },
];

const ICON_BY_KEY = new Map(DOWNLOAD_SECTION_ICONS.map(({ key, icon }) => [key, icon]));

export function getDownloadSectionIcon(iconKey: string): LucideIcon {
  return ICON_BY_KEY.get(iconKey) ?? FileText;
}

export function isBuiltinSectionType(
  sectionType: DownloadSectionType,
): sectionType is BuiltinSectionType {
  return sectionType !== "CUSTOM";
}

export function slugForBuiltinSection(sectionType: BuiltinSectionType): string {
  return DOWNLOAD_SECTION_SLUGS[sectionType];
}

export function resolveDownloadSectionSlug(section: {
  sectionType: DownloadSectionType;
  slug: string;
}): string {
  if (isBuiltinSectionType(section.sectionType)) {
    return slugForBuiltinSection(section.sectionType);
  }
  return section.slug;
}

export function downloadSectionTitle(
  section: { titleFa: string; titleEn: string },
  locale: AppLocale,
): string {
  return locale === "fa" ? section.titleFa : section.titleEn;
}

async function fetchItemCounts() {
  const [resourceCounts, customCounts, softwareCount, postersCount, datasheetCount] =
    await Promise.all([
      prisma.downloadResource.groupBy({
        by: ["category"],
        _count: true,
        where: { category: { not: null } },
      }),
      prisma.downloadResource.groupBy({
        by: ["sectionId"],
        _count: true,
        where: { sectionId: { not: null } },
      }),
      prisma.softwareProduct.count({ where: { active: true } }),
      prisma.competitionPoster.count({ where: { active: true } }),
      prisma.datasheetPart.count({ where: { active: true, parentId: null } }),
    ]);

  const countByCategory = new Map<string, number>(
    resourceCounts.map((entry) => [entry.category!, entry._count]),
  );
  const countBySectionId = new Map<string, number>(
    customCounts.map((entry) => [entry.sectionId!, entry._count]),
  );

  return { countByCategory, countBySectionId, softwareCount, postersCount, datasheetCount };
}

function itemCountForSection(
  section: { id: string; sectionType: DownloadSectionType },
  counts: Awaited<ReturnType<typeof fetchItemCounts>>,
): number {
  switch (section.sectionType) {
    case "SOFTWARE":
      return counts.softwareCount;
    case "POSTERS":
      return counts.postersCount;
    case "DATASHEETS":
      return counts.datasheetCount;
    case "BOOKS":
      return counts.countByCategory.get("BOOKS") ?? 0;
    case "COMPONENT_LIBRARIES":
      return counts.countByCategory.get("COMPONENT_LIBRARIES") ?? 0;
    case "CUSTOM":
      return counts.countBySectionId.get(section.id) ?? 0;
  }
}

export type DownloadSectionTile = {
  id: string;
  slug: string;
  icon: LucideIcon;
  titleFa: string;
  titleEn: string;
  count: number;
};

export async function getActiveDownloadSectionTiles(): Promise<DownloadSectionTile[]> {
  const [sections, counts] = await Promise.all([
    prisma.downloadSection.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    fetchItemCounts(),
  ]);

  return sections.map((section) => ({
    id: section.id,
    slug: resolveDownloadSectionSlug(section),
    icon: getDownloadSectionIcon(section.iconKey),
    titleFa: section.titleFa,
    titleEn: section.titleEn,
    count: itemCountForSection(section, counts),
  }));
}

export async function getCustomDownloadSections() {
  return prisma.downloadSection.findMany({
    where: { sectionType: "CUSTOM", active: true },
    orderBy: [{ order: "asc" }, { titleFa: "asc" }],
    select: { id: true, slug: true, titleFa: true, titleEn: true },
  });
}

export async function findDownloadSectionBySlug(slug: string) {
  const builtin = Object.entries(DOWNLOAD_SECTION_SLUGS).find(([, value]) => value === slug);
  if (builtin) {
    return prisma.downloadSection.findFirst({
      where: { sectionType: builtin[0] as BuiltinSectionType, active: true },
    });
  }

  return prisma.downloadSection.findFirst({
    where: { sectionType: "CUSTOM", slug, active: true },
  });
}
