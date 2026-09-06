"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation/product";
import { resolveAparatThumbnail } from "@/lib/aparat";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type ProductFormState = AdminFormState;

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    ...Object.fromEntries(formData),
    tagIds: formData.getAll("tagIds"),
  });
}

function revalidateProductPages(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin/product-tags");
  revalidatePath("/products");
  revalidatePath("/en/products");
  if (slug) {
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/en/products/${slug}`);
  }
}

async function assertTagIdsExist(tagIds: string[]) {
  const count = await prisma.productTag.count({
    where: { id: { in: tagIds } },
  });
  return count === tagIds.length;
}

async function assertCourseExists(courseId: string | null) {
  if (!courseId) return true;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  return Boolean(course);
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

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminSession();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, images, videos, specs, courseId, ...fields } = parsed.data;

  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از انواع محصول معتبر نیست." }, formData);
  }
  if (!(await assertCourseExists(courseId))) {
    return formActionError({ courseId: "دوره انتخاب‌شده معتبر نیست." }, formData);
  }

  const slugTaken = await prisma.product.findUnique({ where: { slug: fields.slug } });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  const resolvedVideos = await withResolvedVideoThumbnails(videos);

  await prisma.product.create({
    data: {
      ...fields,
      courseId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      images: { create: images },
      videos: { create: resolvedVideos },
      specs: { create: specs },
    },
  });

  revalidateProductPages(fields.slug);
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminSession();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) {
    return formActionError({ slug: "محصول یافت نشد." }, formData);
  }

  const { tagIds, images, videos, specs, courseId, ...fields } = parsed.data;

  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از انواع محصول معتبر نیست." }, formData);
  }
  if (!(await assertCourseExists(courseId))) {
    return formActionError({ courseId: "دوره انتخاب‌شده معتبر نیست." }, formData);
  }

  const slugOwner = await prisma.product.findUnique({ where: { slug: fields.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  const resolvedVideos = await withResolvedVideoThumbnails(videos);

  await prisma.product.update({
    where: { id },
    data: {
      ...fields,
      courseId,
      tags: {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      },
      images: { deleteMany: {}, create: images },
      videos: { deleteMany: {}, create: resolvedVideos },
      specs: { deleteMany: {}, create: specs },
    },
  });

  revalidateProductPages(existing.slug);
  if (existing.slug !== fields.slug) {
    revalidateProductPages(fields.slug);
  }
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdminSession();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.product.delete({ where: { id } });
  revalidateProductPages(product?.slug);
}
