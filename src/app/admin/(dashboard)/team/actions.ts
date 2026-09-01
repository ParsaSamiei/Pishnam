"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validation/team-member";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type TeamMemberFormState = AdminFormState;

function revalidateTeamPages() {
  revalidatePath("/admin/team");
  revalidatePath("/about-us/team");
}

export async function createTeamMember(
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.teamMember.create({
    data: {
      ...parsed.data,
      bioFa: parsed.data.bioFa || null,
      bioEn: parsed.data.bioEn || null,
      resume: parsed.data.resume || null,
    },
  });
  revalidateTeamPages();
  redirect("/admin/team");
}

export async function updateTeamMember(
  id: string,
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.teamMember.update({
    where: { id },
    data: {
      ...parsed.data,
      bioFa: parsed.data.bioFa || null,
      bioEn: parsed.data.bioEn || null,
      resume: parsed.data.resume || null,
    },
  });
  revalidateTeamPages();
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.teamMember.delete({ where: { id } });
  revalidateTeamPages();
}
