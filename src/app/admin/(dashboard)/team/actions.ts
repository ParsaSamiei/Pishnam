"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validation/team-member";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface TeamMemberFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function revalidateTeamPages() {
  revalidatePath("/admin/team");
  revalidatePath("/about/team");
}

export async function createTeamMember(
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  await prisma.teamMember.create({
    data: { ...parsed.data, bioFa: parsed.data.bioFa || null, bioEn: parsed.data.bioEn || null },
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  await prisma.teamMember.update({
    where: { id },
    data: { ...parsed.data, bioFa: parsed.data.bioFa || null, bioEn: parsed.data.bioEn || null },
  });
  revalidateTeamPages();
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.teamMember.delete({ where: { id } });
  revalidateTeamPages();
}
