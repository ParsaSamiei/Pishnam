"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mediaMentionSchema } from "@/lib/validation/media-mention";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type MediaMentionFormState = AdminFormState;

function revalidateMediaMentionPages() {
  revalidatePath("/admin/media-mentions");
  revalidatePath("/press");
  revalidatePath("/en/press");
  revalidatePath("/");
  revalidatePath("/en");
}

export async function createMediaMention(
  _prevState: MediaMentionFormState,
  formData: FormData,
): Promise<MediaMentionFormState> {
  await requireAdminSession();

  const parsed = mediaMentionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { publishedAt, ...rest } = parsed.data;
  await prisma.mediaMention.create({
    data: {
      ...rest,
      publishedAt: new Date(publishedAt),
    },
  });

  revalidateMediaMentionPages();
  redirect("/admin/media-mentions");
}

export async function updateMediaMention(
  id: string,
  _prevState: MediaMentionFormState,
  formData: FormData,
): Promise<MediaMentionFormState> {
  await requireAdminSession();

  const parsed = mediaMentionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { publishedAt, ...rest } = parsed.data;
  await prisma.mediaMention.update({
    where: { id },
    data: {
      ...rest,
      publishedAt: new Date(publishedAt),
    },
  });

  revalidateMediaMentionPages();
  redirect("/admin/media-mentions");
}

export async function deleteMediaMention(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.mediaMention.delete({ where: { id } });
  revalidateMediaMentionPages();
}
