import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { ContactAddress, ContactSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Fixed primary key for the one ContactSettings row. */
export const CONTACT_SETTINGS_ID = "default";

/** Cache tag invalidated when admin updates contact settings. */
export const CONTACT_SETTINGS_CACHE_TAG = "contact-settings";

export type ContactSettingsWithAddresses = ContactSettings & { addresses: ContactAddress[] };

const loadContactSettings = unstable_cache(
  async (): Promise<ContactSettingsWithAddresses | null> => {
    return prisma.contactSettings.findUnique({
      where: { id: CONTACT_SETTINGS_ID },
      include: { addresses: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
    });
  },
  ["contact-settings-v3"],
  { tags: [CONTACT_SETTINGS_CACHE_TAG], revalidate: 3600 },
);

/**
 * Shared across the footer (every public page) and contact/home.
 * React `cache` dedupes within one render; `unstable_cache` reuses the
 * row across prerenders so build/runtime don't re-query Neon every time.
 * Bump the cache key when the stored shape changes so cached addresses also
 * include newly added fields such as branch phone numbers.
 */
export const getContactSettings = cache(loadContactSettings);
