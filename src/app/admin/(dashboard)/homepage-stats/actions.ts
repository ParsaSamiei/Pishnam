"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { homepageStatsSchema } from "@/lib/validation/homepage-stats";
import { HOMEPAGE_STATS_CACHE_TAG, HOMEPAGE_STATS_ID } from "@/lib/homepage-stats";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type HomepageStatsFormState = AdminFormState;

function revalidateHomepageStatsPages() {
  updateTag(HOMEPAGE_STATS_CACHE_TAG);
  revalidatePath("/admin/homepage-stats");
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/[locale]", "page");
}

export async function updateHomepageStats(
  _prevState: HomepageStatsFormState,
  formData: FormData,
): Promise<HomepageStatsFormState> {
  await requireAdminSession();

  const parsed = homepageStatsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.homepageStats.upsert({
    where: { id: HOMEPAGE_STATS_ID },
    create: { id: HOMEPAGE_STATS_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidateHomepageStatsPages();
  redirect("/admin/homepage-stats?saved=1");
}
