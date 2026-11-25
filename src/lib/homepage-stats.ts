import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { HomepageStats } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Fixed primary key for the one HomepageStats row. */
export const HOMEPAGE_STATS_ID = "default";

/** Cache tag invalidated when admin updates homepage stats. */
export const HOMEPAGE_STATS_CACHE_TAG = "homepage-stats";

const loadHomepageStats = unstable_cache(
  async (): Promise<HomepageStats | null> => {
    return prisma.homepageStats.findUnique({ where: { id: HOMEPAGE_STATS_ID } });
  },
  ["homepage-stats"],
  { tags: [HOMEPAGE_STATS_CACHE_TAG], revalidate: 3600 },
);

/**
 * Shared by the homepage hero. React `cache` dedupes within one render;
 * `unstable_cache` reuses the row across prerenders.
 */
export const getHomepageStats = cache(loadHomepageStats);
