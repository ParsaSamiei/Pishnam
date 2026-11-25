"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { datasheetPartSchema } from "@/lib/validation/datasheet-part";
import { findDatasheetSlugConflict } from "@/lib/datasheet-parts";
import { resolveAparatThumbnail } from "@/lib/aparat";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type DatasheetPartFormState = AdminFormState;

function revalidateDatasheetPages(paths: string[] = []) {
  revalidatePath("/admin/datasheets");
  revalidatePath("/downloads");
  revalidatePath("/downloads/datasheets");
  revalidatePath("/en/downloads");
  revalidatePath("/en/downloads/datasheets");
  for (const path of paths) {
    revalidatePath(path);
    revalidatePath(`/en${path}`);
  }
}

async function withResolvedVideoThumbnails(
  videos: {
    titleFa: string;
    titleEn: string;
    aparatUrl: string | null;
    hostedVideo: string | null;
    thumbnail: string | null;
    order: number;
    active: boolean;
  }[],
) {
  return Promise.all(
    videos.map(async (video) => {
      if (video.hostedVideo) {
        return { ...video, aparatUrl: null };
      }
      if (video.aparatUrl) {
        return {
          ...video,
          hostedVideo: null,
          thumbnail: await resolveAparatThumbnail(video.thumbnail ?? "", video.aparatUrl),
        };
      }
      return video;
    }),
  );
}

async function resolveParentId(parentId: string | null) {
  if (!parentId) return { ok: true as const, parent: null };

  const parent = await prisma.datasheetPart.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true, slug: true },
  });
  if (!parent) {
    return { ok: false as const, error: "قطعه والد پیدا نشد." };
  }
  if (parent.parentId) {
    return { ok: false as const, error: "فقط یک سطح زیرقطعه مجاز است." };
  }
  return { ok: true as const, parent };
}

export async function createDatasheetPart(
  _prevState: DatasheetPartFormState,
  formData: FormData,
): Promise<DatasheetPartFormState> {
  await requireAdminSession();

  const parsed = datasheetPartSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { documents, videos, images, codeSamples, parentId, ...fields } = parsed.data;
  const parentResult = await resolveParentId(parentId);
  if (!parentResult.ok) {
    return formActionError({ parentId: parentResult.error }, formData);
  }

  const slugTaken = await findDatasheetSlugConflict({ slug: fields.slug, parentId });
  if (slugTaken) {
    return formActionError({ slug: "این نامک در این سطح قبلاً استفاده شده است." }, formData);
  }

  const resolvedVideos = await withResolvedVideoThumbnails(videos);

  await prisma.datasheetPart.create({
    data: {
      ...fields,
      parentId,
      documents: { create: documents },
      videos: { create: resolvedVideos },
      images: { create: images },
      codeSamples: { create: codeSamples },
    },
  });

  const parentSlug = parentResult.parent?.slug;
  const publicPath = parentSlug
    ? `/downloads/datasheets/${parentSlug}/${fields.slug}`
    : `/downloads/datasheets/${fields.slug}`;
  revalidateDatasheetPages(
    parentSlug ? [`/downloads/datasheets/${parentSlug}`, publicPath] : [publicPath],
  );

  redirect(parentId ? `/admin/datasheets/${parentId}/edit` : "/admin/datasheets");
}

export async function updateDatasheetPart(
  id: string,
  _prevState: DatasheetPartFormState,
  formData: FormData,
): Promise<DatasheetPartFormState> {
  await requireAdminSession();

  const parsed = datasheetPartSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.datasheetPart.findUnique({
    where: { id },
    select: { id: true, parentId: true, parent: { select: { slug: true } } },
  });
  if (!existing) {
    return formActionError({ slug: "این قطعه پیدا نشد." }, formData);
  }

  const { documents, videos, images, codeSamples, parentId: _parentId, ...fields } = parsed.data;

  const slugTaken = await findDatasheetSlugConflict({
    slug: fields.slug,
    parentId: existing.parentId,
    excludeId: id,
  });
  if (slugTaken) {
    return formActionError({ slug: "این نامک در این سطح قبلاً استفاده شده است." }, formData);
  }

  const resolvedVideos = await withResolvedVideoThumbnails(videos);

  await prisma.datasheetPart.update({
    where: { id },
    data: {
      ...fields,
      documents: { deleteMany: {}, create: documents },
      videos: { deleteMany: {}, create: resolvedVideos },
      images: { deleteMany: {}, create: images },
      codeSamples: { deleteMany: {}, create: codeSamples },
    },
  });

  const parentSlug = existing.parent?.slug;
  const publicPath = parentSlug
    ? `/downloads/datasheets/${parentSlug}/${fields.slug}`
    : `/downloads/datasheets/${fields.slug}`;
  revalidateDatasheetPages(
    parentSlug ? [`/downloads/datasheets/${parentSlug}`, publicPath] : [publicPath],
  );

  redirect(existing.parentId ? `/admin/datasheets/${existing.parentId}/edit` : "/admin/datasheets");
}

export async function deleteDatasheetPart(id: string): Promise<void> {
  await requireAdminSession();
  const part = await prisma.datasheetPart.findUnique({
    where: { id },
    select: { parentId: true, slug: true, parent: { select: { slug: true } } },
  });
  await prisma.datasheetPart.delete({ where: { id } });
  const paths: string[] = [];
  if (part?.parent) {
    paths.push(`/downloads/datasheets/${part.parent.slug}`);
    paths.push(`/downloads/datasheets/${part.parent.slug}/${part.slug}`);
  } else if (part) {
    paths.push(`/downloads/datasheets/${part.slug}`);
  }
  revalidateDatasheetPages(paths);
}
