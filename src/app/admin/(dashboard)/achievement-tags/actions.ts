"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { achievementTagSchema } from "@/lib/validation/achievement-tag";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type AchievementTagFormState = AdminFormState;

function revalidateAchievementTagPages() {
  revalidatePath("/admin/achievement-tags");
  revalidatePath("/admin/achievements");
  revalidatePath("/");
  revalidatePath("/about-us/achievements");
  revalidatePath("/sponsors");
}

export async function createAchievementTag(
  _prevState: AchievementTagFormState,
  formData: FormData,
): Promise<AchievementTagFormState> {
  await requireAdminSession();

  const parsed = achievementTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugTaken = await prisma.achievementTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.achievementTag.create({ data: parsed.data });
  revalidateAchievementTagPages();
  redirect("/admin/achievement-tags");
}

export async function updateAchievementTag(
  id: string,
  _prevState: AchievementTagFormState,
  formData: FormData,
): Promise<AchievementTagFormState> {
  await requireAdminSession();

  const parsed = achievementTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.achievementTag.findUnique({ where: { id } });
  if (!existing) {
    return formActionError({ slug: "برچسب یافت نشد." }, formData);
  }

  const slugOwner = await prisma.achievementTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.achievementTag.update({ where: { id }, data: parsed.data });
  revalidateAchievementTagPages();
  redirect("/admin/achievement-tags");
}

export async function deleteAchievementTag(id: string): Promise<void | { error?: string }> {
  await requireAdminSession();

  const tag = await prisma.achievementTag.findUnique({
    where: { id },
    include: { _count: { select: { achievements: true } } },
  });
  if (!tag) {
    return { error: "برچسب یافت نشد." };
  }
  if (tag._count.achievements > 0) {
    return {
      error: `این برچسب روی ${tag._count.achievements} افتخار استفاده شده است. ابتدا برچسب آن افتخارات را عوض کنید.`,
    };
  }

  await prisma.achievementTag.delete({ where: { id } });
  revalidateAchievementTagPages();
}
