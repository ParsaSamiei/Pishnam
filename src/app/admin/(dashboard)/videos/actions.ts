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

async function resolveVideoEntryFields({
  aparatUrl,
  hostedVideo,
  thumbnail,
}: {
  aparatUrl: string | null;
  hostedVideo: string | null;
  thumbnail: string | null;
}) {
  if (hostedVideo) {
    return {
      aparatUrl: null,
      hostedVideo,
      thumbnail: thumbnail || null,
    };
  }

  if (aparatUrl) {
    return {
      aparatUrl,
      hostedVideo: null,
      thumbnail: await resolveAparatThumbnail(thumbnail ?? "", aparatUrl),
    };
  }

  return {
    aparatUrl: null,
    hostedVideo: null,
    thumbnail: null,
  };
}

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

  const { publishedAt, thumbnail, aparatUrl, hostedVideo, ...rest } = parsed.data;
  const videoFields = await resolveVideoEntryFields({ aparatUrl, hostedVideo, thumbnail });

  await prisma.videoEntry.create({
    data: {
      ...rest,
      ...videoFields,
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

  const { publishedAt, thumbnail, aparatUrl, hostedVideo, ...rest } = parsed.data;
  const videoFields = await resolveVideoEntryFields({ aparatUrl, hostedVideo, thumbnail });

  await prisma.videoEntry.update({
    where: { id },
    data: {
      ...rest,
      ...videoFields,
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
