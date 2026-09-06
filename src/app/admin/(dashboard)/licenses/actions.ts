"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { licenseSchema } from "@/lib/validation/license";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type LicenseFormState = AdminFormState;

function revalidateLicensePages() {
  revalidatePath("/admin/licenses");
  revalidatePath("/about-us/licenses");
  revalidatePath("/about-us");
  revalidatePath("/en/about-us/licenses");
  revalidatePath("/en/about-us");
}

function toLicenseData(parsed: ReturnType<typeof licenseSchema.parse>) {
  return {
    titleFa: parsed.titleFa,
    titleEn: parsed.titleEn,
    issuerFa: parsed.issuerFa ?? null,
    issuerEn: parsed.issuerEn ?? null,
    year: parsed.year ?? null,
    image: parsed.image,
    descriptionFa: parsed.descriptionFa ?? null,
    descriptionEn: parsed.descriptionEn ?? null,
    order: parsed.order,
    active: parsed.active,
  };
}

export async function createLicense(
  _prevState: LicenseFormState,
  formData: FormData,
): Promise<LicenseFormState> {
  await requireAdminSession();

  const parsed = licenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.license.create({ data: toLicenseData(parsed.data) });
  revalidateLicensePages();
  redirect("/admin/licenses");
}

export async function updateLicense(
  id: string,
  _prevState: LicenseFormState,
  formData: FormData,
): Promise<LicenseFormState> {
  await requireAdminSession();

  const parsed = licenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.license.update({ where: { id }, data: toLicenseData(parsed.data) });
  revalidateLicensePages();
  redirect("/admin/licenses");
}

export async function deleteLicense(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.license.delete({ where: { id } });
  revalidateLicensePages();
}
