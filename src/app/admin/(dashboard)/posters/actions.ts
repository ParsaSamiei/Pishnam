"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { competitionPosterSchema } from "@/lib/validation/competition-poster";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface CompetitionPosterFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function revalidatePosterPages() {
  revalidatePath("/admin/posters");
  revalidatePath("/downloads");
  revalidatePath("/downloads/posters");
  revalidatePath("/en/downloads");
  revalidatePath("/en/downloads/posters");
}

export async function createCompetitionPoster(
  _prevState: CompetitionPosterFormState,
  formData: FormData,
): Promise<CompetitionPosterFormState> {
  await requireAdminSession();

  const parsed = competitionPosterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { descriptionFa, descriptionEn, ...rest } = parsed.data;
  await prisma.competitionPoster.create({
    data: {
      ...rest,
      descriptionFa: descriptionFa || null,
      descriptionEn: descriptionEn || null,
    },
  });

  revalidatePosterPages();
  redirect("/admin/posters");
}

export async function updateCompetitionPoster(
  id: string,
  _prevState: CompetitionPosterFormState,
  formData: FormData,
): Promise<CompetitionPosterFormState> {
  await requireAdminSession();

  const parsed = competitionPosterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { descriptionFa, descriptionEn, ...rest } = parsed.data;
  await prisma.competitionPoster.update({
    where: { id },
    data: {
      ...rest,
      descriptionFa: descriptionFa || null,
      descriptionEn: descriptionEn || null,
    },
  });

  revalidatePosterPages();
  redirect("/admin/posters");
}

export async function deleteCompetitionPoster(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.competitionPoster.delete({ where: { id } });
  revalidatePosterPages();
}
