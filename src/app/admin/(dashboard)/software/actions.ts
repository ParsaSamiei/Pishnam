"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { softwareProductSchema } from "@/lib/validation/software-product";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type SoftwareProductFormState = AdminFormState;

function revalidateSoftwarePages(slug?: string) {
  revalidatePath("/admin/software");
  revalidatePath("/admin/software-releases");
  revalidatePath("/downloads");
  revalidatePath("/downloads/software");
  revalidatePath("/en/downloads");
  revalidatePath("/en/downloads/software");
  if (slug) {
    revalidatePath(`/downloads/software/${slug}`);
    revalidatePath(`/en/downloads/software/${slug}`);
  }
}

export async function createSoftwareProduct(
  _prevState: SoftwareProductFormState,
  formData: FormData,
): Promise<SoftwareProductFormState> {
  await requireAdminSession();

  const parsed = softwareProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { descriptionFa, descriptionEn, ...rest } = parsed.data;

  const slugTaken = await prisma.softwareProduct.findUnique({ where: { slug: rest.slug } });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.softwareProduct.create({
    data: {
      ...rest,
      descriptionFa: descriptionFa || null,
      descriptionEn: descriptionEn || null,
    },
  });

  revalidateSoftwarePages(rest.slug);
  redirect("/admin/software");
}

export async function updateSoftwareProduct(
  id: string,
  _prevState: SoftwareProductFormState,
  formData: FormData,
): Promise<SoftwareProductFormState> {
  await requireAdminSession();

  const parsed = softwareProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { descriptionFa, descriptionEn, ...rest } = parsed.data;

  const slugOwner = await prisma.softwareProduct.findUnique({ where: { slug: rest.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.softwareProduct.update({
    where: { id },
    data: {
      ...rest,
      descriptionFa: descriptionFa || null,
      descriptionEn: descriptionEn || null,
    },
  });

  revalidateSoftwarePages(rest.slug);
  redirect("/admin/software");
}

export async function deleteSoftwareProduct(id: string): Promise<void> {
  await requireAdminSession();
  // onDelete: Cascade on SoftwareRelease.product -- deleting a product also
  // removes its releases, same as Course -> ClassSession.
  await prisma.softwareProduct.delete({ where: { id } });
  revalidateSoftwarePages();
}
