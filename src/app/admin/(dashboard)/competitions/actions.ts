"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { competitionSchema } from "@/lib/validation/competition";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type CompetitionFormState = AdminFormState;

function revalidateCompetitionPages() {
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/leagues");
  revalidatePath("/admin/poster-categories");
  revalidatePath("/admin/posters");
  revalidatePath("/downloads");
  revalidatePath("/downloads/posters");
  revalidatePath("/en/downloads");
  revalidatePath("/en/downloads/posters");
}

export async function createCompetition(
  _prevState: CompetitionFormState,
  formData: FormData,
): Promise<CompetitionFormState> {
  await requireAdminSession();

  const parsed = competitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugTaken = await prisma.competition.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.competition.create({ data: parsed.data });

  revalidateCompetitionPages();
  redirect("/admin/competitions");
}

export async function updateCompetition(
  id: string,
  _prevState: CompetitionFormState,
  formData: FormData,
): Promise<CompetitionFormState> {
  await requireAdminSession();

  const parsed = competitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugOwner = await prisma.competition.findUnique({ where: { slug: parsed.data.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.competition.update({ where: { id }, data: parsed.data });

  revalidateCompetitionPages();
  redirect("/admin/competitions");
}

export async function deleteCompetition(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.competition.delete({ where: { id } });
  revalidateCompetitionPages();
}
