"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { videoEntrySchema } from "@/lib/validation/video-entry";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface VideoEntryFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { publishedAt, thumbnail, ...rest } = parsed.data;
  await prisma.videoEntry.create({
    data: { ...rest, thumbnail: thumbnail || null, publishedAt: new Date(publishedAt) },
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { publishedAt, thumbnail, ...rest } = parsed.data;
  await prisma.videoEntry.update({
    where: { id },
    data: { ...rest, thumbnail: thumbnail || null, publishedAt: new Date(publishedAt) },
  });

  revalidateVideoPages();
  redirect("/admin/videos");
}

export async function deleteVideoEntry(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.videoEntry.delete({ where: { id } });
  revalidateVideoPages();
}
