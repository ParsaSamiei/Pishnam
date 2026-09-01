"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { downloadResourceSchema } from "@/lib/validation/download-resource";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type DownloadResourceFormState = AdminFormState;

function revalidateDownloadPages() {
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
  revalidatePath("/downloads/[category]", "page");
  revalidatePath("/en/downloads");
  revalidatePath("/en/downloads/[category]", "page");
  revalidatePath("/");
  revalidatePath("/en");
}

export async function createDownloadResource(
  _prevState: DownloadResourceFormState,
  formData: FormData,
): Promise<DownloadResourceFormState> {
  await requireAdminSession();

  const parsed = downloadResourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { cadTool, descriptionFa, descriptionEn, ...rest } = parsed.data;
  await prisma.downloadResource.create({
    data: {
      ...rest,
      cadTool: cadTool || null,
      descriptionFa: descriptionFa || null,
      descriptionEn: descriptionEn || null,
    },
  });

  revalidateDownloadPages();
  redirect("/admin/downloads");
}

export async function updateDownloadResource(
  id: string,
  _prevState: DownloadResourceFormState,
  formData: FormData,
): Promise<DownloadResourceFormState> {
  await requireAdminSession();

  const parsed = downloadResourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { cadTool, descriptionFa, descriptionEn, ...rest } = parsed.data;
  await prisma.downloadResource.update({
    where: { id },
    data: {
      ...rest,
      cadTool: cadTool || null,
      descriptionFa: descriptionFa || null,
      descriptionEn: descriptionEn || null,
    },
  });

  revalidateDownloadPages();
  redirect("/admin/downloads");
}

export async function deleteDownloadResource(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.downloadResource.delete({ where: { id } });
  revalidateDownloadPages();
}
