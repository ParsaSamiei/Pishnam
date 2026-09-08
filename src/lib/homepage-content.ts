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

function parseCopy(raw: unknown): HomepageContentCopy {
  const parsed = homepageContentSchema.safeParse(raw);
  // Corrupt / partial rows fall back to defaults so a bad save never blanks the site.
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
  ["homepage-content"],
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
