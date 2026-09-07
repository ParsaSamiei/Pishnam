"use server";

import type { AdminFormState } from "@/lib/form-state";
import { formActionError } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validation/team-member";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type TeamMemberFormState = AdminFormState;

function parseTeamMemberForm(formData: FormData) {
  return teamMemberSchema.safeParse({
    ...Object.fromEntries(formData),
    tagIds: formData.getAll("tagIds"),
  });
}

async function revalidateTeamPages() {
  revalidatePath("/admin/team");
  revalidatePath("/admin/team-tags");
  revalidatePath("/about-us/team");
  revalidatePath("/en/about-us/team");
}

async function assertTagIdsExist(tagIds: string[]) {
  const count = await prisma.teamTag.count({
    where: { id: { in: tagIds } },
  });
  return count === tagIds.length;
}

export async function createTeamMember(
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, bioFa, bioEn, resume, ...rest } = parsed.data;
  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از دسته‌بندی‌ها معتبر نیست." }, formData);
  }

  await prisma.teamMember.create({
    data: {
      ...rest,
      bioFa: bioFa || null,
      bioEn: bioEn || null,
      resume: resume || null,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  await revalidateTeamPages();
  redirect("/admin/team");
}

export async function updateTeamMember(
  id: string,
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, bioFa, bioEn, resume, ...rest } = parsed.data;
  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از دسته‌بندی‌ها معتبر نیست." }, formData);
  }

  await prisma.$transaction([
    prisma.teamMemberTag.deleteMany({ where: { memberId: id } }),
    prisma.teamMember.update({
      where: { id },
      data: {
        ...rest,
        bioFa: bioFa || null,
        bioEn: bioEn || null,
        resume: resume || null,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    }),
  ]);

  await revalidateTeamPages();
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.teamMember.delete({ where: { id } });
  await revalidateTeamPages();
}
