"use server";

import type { AdminFormState } from "@/lib/form-state";
import { formActionError } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { galleryImageSchema } from "@/lib/validation/gallery-image";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type GalleryImageFormState = AdminFormState;

function parseGalleryImageForm(formData: FormData) {
  return galleryImageSchema.safeParse({
    ...Object.fromEntries(formData),
    tagIds: formData.getAll("tagIds"),
  });
}

function revalidateGalleryPages() {
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/gallery-tags");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/gallery", "page");
}

async function assertTagIdsExist(tagIds: string[]) {
  if (tagIds.length === 0) return true;
  const count = await prisma.galleryTag.count({
    where: { id: { in: tagIds } },
  });
  return count === tagIds.length;
}

export async function createGalleryImage(
  _prevState: GalleryImageFormState,
  formData: FormData,
): Promise<GalleryImageFormState> {
  await requireAdminSession();

  const parsed = parseGalleryImageForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, ...data } = parsed.data;
  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از برچسب‌ها معتبر نیست." }, formData);
  }

  await prisma.galleryImage.create({
    data: {
      ...data,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });
  revalidateGalleryPages();
  redirect("/admin/gallery");
}

export async function updateGalleryImage(
  id: string,
  _prevState: GalleryImageFormState,
  formData: FormData,
): Promise<GalleryImageFormState> {
  await requireAdminSession();

  const parsed = parseGalleryImageForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, ...data } = parsed.data;
  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از برچسب‌ها معتبر نیست." }, formData);
  }

  await prisma.$transaction([
    prisma.galleryImageTag.deleteMany({ where: { imageId: id } }),
    prisma.galleryImage.update({
      where: { id },
      data: {
        ...data,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    }),
  ]);
  revalidateGalleryPages();
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.galleryImage.delete({ where: { id } });
  revalidateGalleryPages();
}
