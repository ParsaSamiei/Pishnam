"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validation/course";
import { resolveAparatThumbnail } from "@/lib/aparat";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type CourseFormState = AdminFormState;

function revalidateCoursePages(slug?: string) {
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/en/courses");
  if (slug) {
    revalidatePath(`/courses/${slug}`);
    revalidatePath(`/en/courses/${slug}`);
  }
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/enroll");
  revalidatePath("/en/enroll");
}

async function resolveCourseVideoFields({
  aparatUrl,
  hostedVideo,
  videoThumbnail,
}: {
  aparatUrl: string | null;
  hostedVideo: string | null;
  videoThumbnail: string | null;
}) {
  if (hostedVideo) {
    return {
      aparatUrl: null,
      hostedVideo,
      videoThumbnail: videoThumbnail || null,
    };
  }

  if (aparatUrl) {
    return {
      aparatUrl,
      hostedVideo: null,
      videoThumbnail: await resolveAparatThumbnail(videoThumbnail ?? "", aparatUrl),
    };
  }

  return {
    aparatUrl: null,
    hostedVideo: null,
    videoThumbnail: null,
  };
}

export async function createCourse(
  _prevState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdminSession();

  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const {
    titleFa,
    excerptFa,
    bodyFa,
    prerequisitesFa,
    titleEn,
    excerptEn,
    bodyEn,
    prerequisitesEn,
    aparatUrl,
    hostedVideo,
    videoThumbnail,
    ...courseFields
  } = parsed.data;

  const slugTaken = await prisma.course.findUnique({ where: { slug: courseFields.slug } });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  const videoFields = await resolveCourseVideoFields({ aparatUrl, hostedVideo, videoThumbnail });

  await prisma.course.create({
    data: {
      ...courseFields,
      ...videoFields,
      translations: {
        create: [
          {
            locale: "fa",
            title: titleFa,
            excerpt: excerptFa,
            body: bodyFa,
            prerequisites: prerequisitesFa || null,
          },
          {
            locale: "en",
            title: titleEn,
            excerpt: excerptEn,
            body: bodyEn,
            prerequisites: prerequisitesEn || null,
          },
        ],
      },
    },
  });

  revalidateCoursePages(courseFields.slug);
  redirect("/admin/courses");
}

export async function updateCourse(
  id: string,
  _prevState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdminSession();

  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const {
    titleFa,
    excerptFa,
    bodyFa,
    prerequisitesFa,
    titleEn,
    excerptEn,
    bodyEn,
    prerequisitesEn,
    aparatUrl,
    hostedVideo,
    videoThumbnail,
    ...courseFields
  } = parsed.data;

  const slugOwner = await prisma.course.findUnique({ where: { slug: courseFields.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  const videoFields = await resolveCourseVideoFields({ aparatUrl, hostedVideo, videoThumbnail });

  await prisma.course.update({
    where: { id },
    data: {
      ...courseFields,
      ...videoFields,
      translations: {
        upsert: [
          {
            where: { courseId_locale: { courseId: id, locale: "fa" } },
            create: {
              locale: "fa",
              title: titleFa,
              excerpt: excerptFa,
              body: bodyFa,
              prerequisites: prerequisitesFa || null,
            },
            update: {
              title: titleFa,
              excerpt: excerptFa,
              body: bodyFa,
              prerequisites: prerequisitesFa || null,
            },
          },
          {
            where: { courseId_locale: { courseId: id, locale: "en" } },
            create: {
              locale: "en",
              title: titleEn,
              excerpt: excerptEn,
              body: bodyEn,
              prerequisites: prerequisitesEn || null,
            },
            update: {
              title: titleEn,
              excerpt: excerptEn,
              body: bodyEn,
              prerequisites: prerequisitesEn || null,
            },
          },
        ],
      },
    },
  });

  revalidateCoursePages(courseFields.slug);
  redirect("/admin/courses");
}

export async function deleteCourse(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.course.delete({ where: { id } });
  revalidateCoursePages();
}
