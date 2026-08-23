"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { softwareReleaseSchema } from "@/lib/validation/software-release";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface SoftwareReleaseFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

async function revalidateForProduct(productId: string) {
  const product = await prisma.softwareProduct.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  revalidatePath("/admin/software-releases");
  revalidatePath("/downloads/software");
  revalidatePath("/en/downloads/software");
  if (product) {
    revalidatePath(`/downloads/software/${product.slug}`);
    revalidatePath(`/en/downloads/software/${product.slug}`);
  }
}

export async function createSoftwareRelease(
  _prevState: SoftwareReleaseFormState,
  formData: FormData,
): Promise<SoftwareReleaseFormState> {
  await requireAdminSession();

  const parsed = softwareReleaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { notesFa, notesEn, ...rest } = parsed.data;
  await prisma.softwareRelease.create({
    data: {
      ...rest,
      notesFa: notesFa || null,
      notesEn: notesEn || null,
    },
  });

  await revalidateForProduct(rest.productId);
  redirect("/admin/software-releases");
}

export async function updateSoftwareRelease(
  id: string,
  _prevState: SoftwareReleaseFormState,
  formData: FormData,
): Promise<SoftwareReleaseFormState> {
  await requireAdminSession();

  const parsed = softwareReleaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { notesFa, notesEn, ...rest } = parsed.data;
  await prisma.softwareRelease.update({
    where: { id },
    data: {
      ...rest,
      notesFa: notesFa || null,
      notesEn: notesEn || null,
    },
  });

  await revalidateForProduct(rest.productId);
  redirect("/admin/software-releases");
}

export async function deleteSoftwareRelease(id: string): Promise<void> {
  await requireAdminSession();
  const release = await prisma.softwareRelease.delete({ where: { id } });
  await revalidateForProduct(release.productId);
}
