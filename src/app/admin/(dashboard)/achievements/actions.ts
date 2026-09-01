"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { achievementSchema } from "@/lib/validation/achievement";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type AchievementFormState = AdminFormState;

function revalidateAchievementPages() {
  revalidatePath("/admin/achievements");
  revalidatePath("/"); // homepage featured-achievements teaser
  revalidatePath("/about-us/achievements");
  revalidatePath("/sponsors");
}

export async function createAchievement(
  _prevState: AchievementFormState,
  formData: FormData,
): Promise<AchievementFormState> {
  await requireAdminSession();

  const parsed = achievementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.achievement.create({ data: parsed.data });
  revalidateAchievementPages();
  redirect("/admin/achievements");
}

export async function updateAchievement(
  id: string,
  _prevState: AchievementFormState,
  formData: FormData,
): Promise<AchievementFormState> {
  await requireAdminSession();

  const parsed = achievementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.achievement.update({ where: { id }, data: parsed.data });
  revalidateAchievementPages();
  redirect("/admin/achievements");
}

export async function deleteAchievement(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.achievement.delete({ where: { id } });
  revalidateAchievementPages();
}
