"use server";

import type { AdminFormState } from "@/lib/form-state";
import { formActionError } from "@/lib/form-state";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  homepageContentFromFormData,
  homepageContentSchema,
} from "@/lib/validation/homepage-content";
import { HOMEPAGE_CONTENT_CACHE_TAG, HOMEPAGE_CONTENT_ID } from "@/lib/homepage-content";
import { requireAdminSession } from "@/lib/actions/admin-guard";

export type HomepageContentFormState = AdminFormState;

function revalidateHomepageContentPages() {
  updateTag(HOMEPAGE_CONTENT_CACHE_TAG);
  revalidatePath("/admin/homepage-content");
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/[locale]", "page");
}

function nestedFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function updateHomepageContent(
  _prevState: HomepageContentFormState,
  formData: FormData,
): Promise<HomepageContentFormState> {
  await requireAdminSession();

  const parsed = homepageContentSchema.safeParse(homepageContentFromFormData(formData));
  if (!parsed.success) {
    return formActionError(nestedFieldErrors(parsed.error.issues), formData);
  }

  const copy = parsed.data as unknown as Prisma.InputJsonValue;

  await prisma.homepageContent.upsert({
    where: { id: HOMEPAGE_CONTENT_ID },
    create: { id: HOMEPAGE_CONTENT_ID, copy },
    update: { copy },
  });

  revalidateHomepageContentPages();
  redirect("/admin/homepage-content?saved=1");
}
