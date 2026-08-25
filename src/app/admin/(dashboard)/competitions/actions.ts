"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { competitionSchema } from "@/lib/validation/competition";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface CompetitionFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const slugTaken = await prisma.competition.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) {
    return { status: "error", errors: { slug: "این نامک قبلاً استفاده شده است." } };
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const slugOwner = await prisma.competition.findUnique({ where: { slug: parsed.data.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return { status: "error", errors: { slug: "این نامک قبلاً استفاده شده است." } };
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
