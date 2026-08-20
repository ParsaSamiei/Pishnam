"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { achievementSchema } from "@/lib/validation/achievement";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface AchievementFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function revalidateAchievementPages() {
  revalidatePath("/admin/achievements");
  revalidatePath("/"); // homepage featured-achievements teaser
  revalidatePath("/about/achievements");
  revalidatePath("/sponsors");
}

export async function createAchievement(
  _prevState: AchievementFormState,
  formData: FormData,
): Promise<AchievementFormState> {
  await requireAdminSession();

  const parsed = achievementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
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
