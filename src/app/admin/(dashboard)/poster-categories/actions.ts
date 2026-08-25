"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { posterCategorySchema } from "@/lib/validation/poster-category";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface PosterCategoryFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
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
    return { status: "error", errors: { slug: "این نامک در این لیگ قبلاً استفاده شده است." } };
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
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
    return { status: "error", errors: { slug: "این نامک در این لیگ قبلاً استفاده شده است." } };
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
