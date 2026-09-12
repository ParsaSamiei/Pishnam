import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content.defaults";
import {
  homepageContentSchema,
  resolveHomepageCopy,
  type HomepageContentCopy,
  type HomepageCopy,
} from "@/lib/validation/homepage-content";
import type { AppLocale } from "@/lib/i18n/routing";

/** Fixed primary key for the one HomepageContent row. */
export const HOMEPAGE_CONTENT_ID = "default";

/** Cache tag invalidated when admin updates homepage copy. */
export const HOMEPAGE_CONTENT_CACHE_TAG = "homepage-content";

/**
 * Deep-merge saved JSON onto defaults so newly-added fields (e.g. PishLab)
 * appear without wiping custom copy, then validate.
 */
function parseCopy(raw: unknown): HomepageContentCopy {
  if (!raw || typeof raw !== "object") return DEFAULT_HOMEPAGE_CONTENT;

  const saved = raw as Partial<HomepageContentCopy>;
  const savedRelated = (saved.related ?? {}) as Partial<HomepageContentCopy["related"]>;

  const merged: HomepageContentCopy = {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...saved,
    hero: { ...DEFAULT_HOMEPAGE_CONTENT.hero, ...saved.hero },
    audiences: {
      ...DEFAULT_HOMEPAGE_CONTENT.audiences,
      ...saved.audiences,
      parents: {
        ...DEFAULT_HOMEPAGE_CONTENT.audiences.parents,
        ...saved.audiences?.parents,
      },
      schools: {
        ...DEFAULT_HOMEPAGE_CONTENT.audiences.schools,
        ...saved.audiences?.schools,
      },
      sponsors: {
        ...DEFAULT_HOMEPAGE_CONTENT.audiences.sponsors,
        ...saved.audiences?.sponsors,
      },
    },
    achievements: { ...DEFAULT_HOMEPAGE_CONTENT.achievements, ...saved.achievements },
    mediaMentions: { ...DEFAULT_HOMEPAGE_CONTENT.mediaMentions, ...saved.mediaMentions },
    news: { ...DEFAULT_HOMEPAGE_CONTENT.news, ...saved.news },
    videos: { ...DEFAULT_HOMEPAGE_CONTENT.videos, ...saved.videos },
    gallery: { ...DEFAULT_HOMEPAGE_CONTENT.gallery, ...saved.gallery },
    downloads: { ...DEFAULT_HOMEPAGE_CONTENT.downloads, ...saved.downloads },
    related: {
      ...DEFAULT_HOMEPAGE_CONTENT.related,
      ...savedRelated,
      pishcup: {
        ...DEFAULT_HOMEPAGE_CONTENT.related.pishcup,
        ...savedRelated.pishcup,
      },
      pishtalk: {
        ...DEFAULT_HOMEPAGE_CONTENT.related.pishtalk,
        ...savedRelated.pishtalk,
      },
      pishlab: {
        ...DEFAULT_HOMEPAGE_CONTENT.related.pishlab,
        ...savedRelated.pishlab,
      },
    },
  };

  const parsed = homepageContentSchema.safeParse(merged);
  // Corrupt rows fall back to defaults so a bad save never blanks the site.
  return parsed.success ? parsed.data : DEFAULT_HOMEPAGE_CONTENT;
}

const loadHomepageContentCopy = unstable_cache(
  async (): Promise<HomepageContentCopy> => {
    const row = await prisma.homepageContent.findUnique({
      where: { id: HOMEPAGE_CONTENT_ID },
    });
    if (!row) return DEFAULT_HOMEPAGE_CONTENT;
    return parseCopy(row.copy);
  },
  // Bump when HomepageContentCopy shape gains required nested fields.
  ["homepage-content", "v2-pishlab"],
  { tags: [HOMEPAGE_CONTENT_CACHE_TAG], revalidate: 3600 },
);

/**
 * Bilingual landing copy for the admin form. Falls back to in-code defaults
 * until `/admin/homepage-content` is saved once.
 */
export const getHomepageContentCopy = cache(loadHomepageContentCopy);

/**
 * Locale-resolved landing copy for public home sections.
 */
export const getHomepageCopy = cache(async (locale: AppLocale): Promise<HomepageCopy> => {
  const copy = await getHomepageContentCopy();
  return resolveHomepageCopy(copy, locale);
});
