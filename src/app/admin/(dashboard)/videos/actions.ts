"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { videoEntrySchema } from "@/lib/validation/video-entry";
import { resolveAparatThumbnail } from "@/lib/aparat";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type VideoEntryFormState = AdminFormState;

function revalidateVideoPages() {
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  revalidatePath("/en/videos");
  revalidatePath("/");
  revalidatePath("/en");
}

// Checkbox groups (tierTags) submit multiple values under the same
// FormData key -- Object.fromEntries() would silently drop all but the
// last one, so tierTags is read via getAll() and spliced in instead.
function parseVideoForm(formData: FormData) {
  return videoEntrySchema.safeParse({
    ...Object.fromEntries(formData),
    tierTags: formData.getAll("tierTags"),
  });
}

export async function createVideoEntry(
  _prevState: VideoEntryFormState,
  formData: FormData,
): Promise<VideoEntryFormState> {
  await requireAdminSession();

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { publishedAt, thumbnail, aparatUrl, ...rest } = parsed.data;
  await prisma.videoEntry.create({
    data: {
      ...rest,
      aparatUrl,
      thumbnail: await resolveAparatThumbnail(thumbnail ?? "", aparatUrl),
      publishedAt: new Date(publishedAt),
    },
  });

  revalidateVideoPages();
  redirect("/admin/videos");
}

export async function updateVideoEntry(
  id: string,
  _prevState: VideoEntryFormState,
  formData: FormData,
): Promise<VideoEntryFormState> {
  await requireAdminSession();

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { publishedAt, thumbnail, aparatUrl, ...rest } = parsed.data;
  await prisma.videoEntry.update({
    where: { id },
    data: {
      ...rest,
      aparatUrl,
      thumbnail: await resolveAparatThumbnail(thumbnail ?? "", aparatUrl),
      publishedAt: new Date(publishedAt),
    },
  });

  revalidateVideoPages();
  redirect("/admin/videos");
}

export async function deleteVideoEntry(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.videoEntry.delete({ where: { id } });
  revalidateVideoPages();
}
