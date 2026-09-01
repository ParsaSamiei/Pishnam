"use server";

import type { AdminFormState } from "@/lib/form-state";
import { formActionError } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { downloadSectionSchema } from "@/lib/validation/download-section";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import type { DownloadSectionType } from "@prisma/client";

export type DownloadSectionFormState = AdminFormState;

function revalidateDownloadSectionPages() {
  revalidatePath("/admin/download-sections");
  revalidatePath("/[locale]/downloads", "page");
  revalidatePath("/[locale]/downloads/[category]", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/sitemap.xml");
}

async function assertBuiltinTypeAvailable(
  sectionType: DownloadSectionType,
  excludeId?: string,
): Promise<boolean> {
  if (sectionType === "CUSTOM") {
    return true;
  }

  const existing = await prisma.downloadSection.findFirst({
    where: {
      sectionType,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });

  return !existing;
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.downloadSection.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });

  return !existing;
}

export async function createDownloadSection(
  _prevState: DownloadSectionFormState,
  formData: FormData,
): Promise<DownloadSectionFormState> {
  await requireAdminSession();

  const parsed = downloadSectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  if (!(await assertBuiltinTypeAvailable(parsed.data.sectionType))) {
    return formActionError({ sectionType: "این نوع بخش قبلاً ثبت شده است." }, formData);
  }

  if (!(await assertSlugAvailable(parsed.data.slug))) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.downloadSection.create({ data: parsed.data });
  revalidateDownloadSectionPages();
  redirect("/admin/download-sections");
}

export async function updateDownloadSection(
  id: string,
  _prevState: DownloadSectionFormState,
  formData: FormData,
): Promise<DownloadSectionFormState> {
  await requireAdminSession();

  const parsed = downloadSectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const current = await prisma.downloadSection.findUnique({ where: { id } });
  if (!current) {
    redirect("/admin/download-sections");
  }

  if (parsed.data.sectionType !== current.sectionType) {
    if (!(await assertBuiltinTypeAvailable(parsed.data.sectionType, id))) {
      return formActionError({ sectionType: "این نوع بخش قبلاً ثبت شده است." }, formData);
    }
  }

  if (parsed.data.slug !== current.slug && !(await assertSlugAvailable(parsed.data.slug, id))) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.downloadSection.update({ where: { id }, data: parsed.data });
  revalidateDownloadSectionPages();
  redirect("/admin/download-sections");
}

export async function deleteDownloadSection(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.downloadSection.delete({ where: { id } });
  revalidateDownloadSectionPages();
}
