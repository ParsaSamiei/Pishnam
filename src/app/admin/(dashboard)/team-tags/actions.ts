"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { teamTagSchema } from "@/lib/validation/team-tag";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type TeamTagFormState = AdminFormState;

function revalidateTeamTagPages(slug?: string) {
  revalidatePath("/admin/team-tags");
  revalidatePath("/admin/team");
  revalidatePath("/about-us/team");
  revalidatePath("/en/about-us/team");
  if (slug) {
    revalidatePath(`/about-us/team/${slug}`);
    revalidatePath(`/en/about-us/team/${slug}`);
  }
}

export async function createTeamTag(
  _prevState: TeamTagFormState,
  formData: FormData,
): Promise<TeamTagFormState> {
  await requireAdminSession();

  const parsed = teamTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugTaken = await prisma.teamTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.teamTag.create({ data: parsed.data });

  revalidateTeamTagPages(parsed.data.slug);
  redirect("/admin/team-tags");
}

export async function updateTeamTag(
  id: string,
  _prevState: TeamTagFormState,
  formData: FormData,
): Promise<TeamTagFormState> {
  await requireAdminSession();

  const parsed = teamTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.teamTag.findUnique({ where: { id } });
  if (!existing) {
    return formActionError({ slug: "دسته‌بندی یافت نشد." }, formData);
  }

  const slugOwner = await prisma.teamTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.teamTag.update({ where: { id }, data: parsed.data });

  revalidateTeamTagPages(existing.slug);
  if (existing.slug !== parsed.data.slug) {
    revalidateTeamTagPages(parsed.data.slug);
  }
  redirect("/admin/team-tags");
}

export async function deleteTeamTag(id: string): Promise<void> {
  await requireAdminSession();
  const tag = await prisma.teamTag.findUnique({ where: { id }, select: { slug: true } });
  await prisma.teamTag.delete({ where: { id } });
  revalidateTeamTagPages(tag?.slug);
}
