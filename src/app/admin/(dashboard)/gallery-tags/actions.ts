"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { galleryTagSchema } from "@/lib/validation/gallery-tag";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type GalleryTagFormState = AdminFormState;

function revalidateGalleryTagPages() {
  revalidatePath("/admin/gallery-tags");
  revalidatePath("/admin/gallery");
  revalidatePath("/[locale]/gallery", "page");
}

export async function createGalleryTag(
  _prevState: GalleryTagFormState,
  formData: FormData,
): Promise<GalleryTagFormState> {
  await requireAdminSession();

  const parsed = galleryTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugTaken = await prisma.galleryTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.galleryTag.create({ data: parsed.data });

  revalidateGalleryTagPages();
  redirect("/admin/gallery-tags");
}

export async function updateGalleryTag(
  id: string,
  _prevState: GalleryTagFormState,
  formData: FormData,
): Promise<GalleryTagFormState> {
  await requireAdminSession();

  const parsed = galleryTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.galleryTag.findUnique({ where: { id } });
  if (!existing) {
    return formActionError({ slug: "برچسب یافت نشد." }, formData);
  }

  const slugOwner = await prisma.galleryTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.galleryTag.update({ where: { id }, data: parsed.data });

  revalidateGalleryTagPages();
  redirect("/admin/gallery-tags");
}

export async function deleteGalleryTag(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.galleryTag.delete({ where: { id } });
  revalidateGalleryTagPages();
}
