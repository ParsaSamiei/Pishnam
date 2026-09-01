"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { posterCategorySchema } from "@/lib/validation/poster-category";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type PosterCategoryFormState = AdminFormState;

function revalidatePosterCategoryPages() {
  revalidatePath("/admin/poster-categories");
  revalidatePath("/admin/posters");
  revalidatePath("/downloads/posters");
  revalidatePath("/en/downloads/posters");
}

export async function createPosterCategory(
  _prevState: PosterCategoryFormState,
  formData: FormData,
): Promise<PosterCategoryFormState> {
  await requireAdminSession();

  const parsed = posterCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugTaken = await prisma.posterCategory.findUnique({
    where: {
      leagueId_slug: {
        leagueId: parsed.data.leagueId,
        slug: parsed.data.slug,
      },
    },
  });
  if (slugTaken) {
    return formActionError({ slug: "این نامک در این لیگ قبلاً استفاده شده است." }, formData);
  }

  await prisma.posterCategory.create({ data: parsed.data });

  revalidatePosterCategoryPages();
  redirect("/admin/poster-categories");
}

export async function updatePosterCategory(
  id: string,
  _prevState: PosterCategoryFormState,
  formData: FormData,
): Promise<PosterCategoryFormState> {
  await requireAdminSession();

  const parsed = posterCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugOwner = await prisma.posterCategory.findUnique({
    where: {
      leagueId_slug: {
        leagueId: parsed.data.leagueId,
        slug: parsed.data.slug,
      },
    },
  });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک در این لیگ قبلاً استفاده شده است." }, formData);
  }

  await prisma.posterCategory.update({ where: { id }, data: parsed.data });

  revalidatePosterCategoryPages();
  redirect("/admin/poster-categories");
}

export async function deletePosterCategory(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.posterCategory.delete({ where: { id } });
  revalidatePosterCategoryPages();
}
