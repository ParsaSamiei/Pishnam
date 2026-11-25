"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { heroSlideSchema } from "@/lib/validation/hero-slide";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type HeroSlideFormState = AdminFormState;

function revalidateHeroSlidePages() {
  revalidatePath("/admin/hero-slides");
  // The homepage lives at /[locale], so the route pattern plus "page" is what
  // covers both /fa and /en -- a bare revalidatePath("/") would only name the
  // unprefixed root. `type` is required whenever the path has a dynamic
  // segment (see next/dist/docs .../functions/revalidatePath.md).
  revalidatePath("/[locale]", "page");
}

export async function createHeroSlide(
  _prevState: HeroSlideFormState,
  formData: FormData,
): Promise<HeroSlideFormState> {
  await requireAdminSession();

  const parsed = heroSlideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.heroSlide.create({ data: parsed.data });
  revalidateHeroSlidePages();
  redirect("/admin/hero-slides");
}

export async function updateHeroSlide(
  id: string,
  _prevState: HeroSlideFormState,
  formData: FormData,
): Promise<HeroSlideFormState> {
  await requireAdminSession();

  const parsed = heroSlideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.heroSlide.update({ where: { id }, data: parsed.data });
  revalidateHeroSlidePages();
  redirect("/admin/hero-slides");
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.heroSlide.delete({ where: { id } });
  revalidateHeroSlidePages();
}
