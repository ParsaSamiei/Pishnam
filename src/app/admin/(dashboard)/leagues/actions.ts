"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { leagueSchema } from "@/lib/validation/league";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface LeagueFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function revalidateLeaguePages() {
  revalidatePath("/admin/leagues");
  revalidatePath("/admin/poster-categories");
  revalidatePath("/admin/posters");
  revalidatePath("/downloads/posters");
  revalidatePath("/en/downloads/posters");
}

export async function createLeague(
  _prevState: LeagueFormState,
  formData: FormData,
): Promise<LeagueFormState> {
  await requireAdminSession();

  const parsed = leagueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const slugTaken = await prisma.league.findUnique({
    where: {
      competitionId_slug: {
        competitionId: parsed.data.competitionId,
        slug: parsed.data.slug,
      },
    },
  });
  if (slugTaken) {
    return { status: "error", errors: { slug: "این نامک در این مسابقه قبلاً استفاده شده است." } };
  }

  await prisma.league.create({ data: parsed.data });

  revalidateLeaguePages();
  redirect("/admin/leagues");
}

export async function updateLeague(
  id: string,
  _prevState: LeagueFormState,
  formData: FormData,
): Promise<LeagueFormState> {
  await requireAdminSession();

  const parsed = leagueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const slugOwner = await prisma.league.findUnique({
    where: {
      competitionId_slug: {
        competitionId: parsed.data.competitionId,
        slug: parsed.data.slug,
      },
    },
  });
  if (slugOwner && slugOwner.id !== id) {
    return { status: "error", errors: { slug: "این نامک در این مسابقه قبلاً استفاده شده است." } };
  }

  await prisma.league.update({ where: { id }, data: parsed.data });

  revalidateLeaguePages();
  redirect("/admin/leagues");
}

export async function deleteLeague(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.league.delete({ where: { id } });
  revalidateLeaguePages();
}
