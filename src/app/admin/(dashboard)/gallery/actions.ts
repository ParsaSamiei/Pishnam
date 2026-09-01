"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { galleryImageSchema } from "@/lib/validation/gallery-image";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type GalleryImageFormState = AdminFormState;

function revalidateGalleryPages() {
  revalidatePath("/admin/gallery");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/gallery", "page");
}

export async function createGalleryImage(
  _prevState: GalleryImageFormState,
  formData: FormData,
): Promise<GalleryImageFormState> {
  await requireAdminSession();

  const parsed = galleryImageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.galleryImage.create({ data: parsed.data });
  revalidateGalleryPages();
  redirect("/admin/gallery");
}

export async function updateGalleryImage(
  id: string,
  _prevState: GalleryImageFormState,
  formData: FormData,
): Promise<GalleryImageFormState> {
  await requireAdminSession();

  const parsed = galleryImageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.galleryImage.update({ where: { id }, data: parsed.data });
  revalidateGalleryPages();
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.galleryImage.delete({ where: { id } });
  revalidateGalleryPages();
}
