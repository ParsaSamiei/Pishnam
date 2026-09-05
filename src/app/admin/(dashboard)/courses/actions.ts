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

function translationPayload(
  locale: "fa" | "en",
  fields: {
    title: string;
    excerpt: string;
    body: string;
    prerequisites: string | null;
    pastResults: string | null;
    learningOutcomes: string[];
  },
) {
  return {
    locale,
    title: fields.title,
    excerpt: fields.excerpt,
    body: fields.body,
    prerequisites: fields.prerequisites,
    pastResults: fields.pastResults,
    learningOutcomes: fields.learningOutcomes,
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
    pastResultsFa,
    learningOutcomesFa,
    titleEn,
    excerptEn,
    bodyEn,
    prerequisitesEn,
    pastResultsEn,
    learningOutcomesEn,
    aparatUrl,
    hostedVideo,
    videoThumbnail,
    documents,
    documentsJson: _documentsJson,
    videoSource: _videoSource,
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
          translationPayload("fa", {
            title: titleFa,
            excerpt: excerptFa,
            body: bodyFa,
            prerequisites: prerequisitesFa || null,
            pastResults: pastResultsFa || null,
            learningOutcomes: learningOutcomesFa,
          }),
          translationPayload("en", {
            title: titleEn,
            excerpt: excerptEn,
            body: bodyEn,
            prerequisites: prerequisitesEn || null,
            pastResults: pastResultsEn || null,
            learningOutcomes: learningOutcomesEn,
          }),
        ],
      },
      documents: {
        create: documents,
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
    pastResultsFa,
    learningOutcomesFa,
    titleEn,
    excerptEn,
    bodyEn,
    prerequisitesEn,
    pastResultsEn,
    learningOutcomesEn,
    aparatUrl,
    hostedVideo,
    videoThumbnail,
    documents,
    documentsJson: _documentsJson,
    videoSource: _videoSource,
    ...courseFields
  } = parsed.data;

  const slugOwner = await prisma.course.findUnique({ where: { slug: courseFields.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  const videoFields = await resolveCourseVideoFields({ aparatUrl, hostedVideo, videoThumbnail });

  const fa = translationPayload("fa", {
    title: titleFa,
    excerpt: excerptFa,
    body: bodyFa,
    prerequisites: prerequisitesFa || null,
    pastResults: pastResultsFa || null,
    learningOutcomes: learningOutcomesFa,
  });
  const en = translationPayload("en", {
    title: titleEn,
    excerpt: excerptEn,
    body: bodyEn,
    prerequisites: prerequisitesEn || null,
    pastResults: pastResultsEn || null,
    learningOutcomes: learningOutcomesEn,
  });

  await prisma.course.update({
    where: { id },
    data: {
      ...courseFields,
      ...videoFields,
      translations: {
        upsert: [
          {
            where: { courseId_locale: { courseId: id, locale: "fa" } },
            create: fa,
            update: {
              title: fa.title,
              excerpt: fa.excerpt,
              body: fa.body,
              prerequisites: fa.prerequisites,
              pastResults: fa.pastResults,
              learningOutcomes: fa.learningOutcomes,
            },
          },
          {
            where: { courseId_locale: { courseId: id, locale: "en" } },
            create: en,
            update: {
              title: en.title,
              excerpt: en.excerpt,
              body: en.body,
              prerequisites: en.prerequisites,
              pastResults: en.pastResults,
              learningOutcomes: en.learningOutcomes,
            },
          },
        ],
      },
      documents: {
        deleteMany: {},
        create: documents,
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
