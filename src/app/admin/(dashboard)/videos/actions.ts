"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { videoEntrySchema } from "@/lib/validation/video-entry";
import { extractAparatHash, fetchAparatPoster } from "@/lib/aparat";
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

// If the admin left the thumbnail field empty (or cleared it), fall back to
// Aparat's own poster for that video instead of showing a blank card until
// the visitor presses play -- see docs/06-admin-panel.md and the form's
// helper text, which both promise this behavior.
async function resolveThumbnail(thumbnail: string, aparatUrl: string): Promise<string | null> {
  if (thumbnail) return thumbnail;
  const hash = extractAparatHash(aparatUrl);
  return hash ? await fetchAparatPoster(hash) : null;
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

  const { publishedAt, thumbnail, aparatUrl, ...rest } = parsed.data;
  await prisma.videoEntry.create({
    data: {
      ...rest,
      aparatUrl,
      thumbnail: await resolveThumbnail(thumbnail ?? "", aparatUrl),
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { publishedAt, thumbnail, aparatUrl, ...rest } = parsed.data;
  await prisma.videoEntry.update({
    where: { id },
    data: {
      ...rest,
      aparatUrl,
      thumbnail: await resolveThumbnail(thumbnail ?? "", aparatUrl),
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
