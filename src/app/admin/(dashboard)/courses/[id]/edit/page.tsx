import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";
import { outcomesToTextarea } from "@/lib/validation/course";
import { updateCourse } from "../../actions";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      translations: true,
      documents: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!course) {
    notFound();
  }

  const fa = course.translations.find((t) => t.locale === "fa");
  const en = course.translations.find((t) => t.locale === "en");
  const boundUpdate = updateCourse.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/courses"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دوره‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش دوره</h1>
      <div className="mt-6">
        <CourseForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          defaultValues={{
            slug: course.slug,
            tier: course.tier,
            topicTags: course.topicTags,
            coverImage: course.coverImage,
            aparatUrl: course.aparatUrl,
            hostedVideo: course.hostedVideo,
            videoThumbnail: course.videoThumbnail,
            order: course.order,
            active: course.active,
            titleFa: fa?.title ?? "",
            excerptFa: fa?.excerpt ?? "",
            bodyFa: fa?.body ?? "",
            prerequisitesFa: fa?.prerequisites ?? "",
            pastResultsFa: fa?.pastResults ?? "",
            learningOutcomesFa: outcomesToTextarea(fa?.learningOutcomes),
            titleEn: en?.title ?? "",
            excerptEn: en?.excerpt ?? "",
            bodyEn: en?.body ?? "",
            prerequisitesEn: en?.prerequisites ?? "",
            pastResultsEn: en?.pastResults ?? "",
            learningOutcomesEn: outcomesToTextarea(en?.learningOutcomes),
            documents: course.documents.map((doc) => ({
              titleFa: doc.titleFa,
              titleEn: doc.titleEn,
              descriptionFa: doc.descriptionFa ?? "",
              descriptionEn: doc.descriptionEn ?? "",
              source: doc.source,
              fileUrl: doc.fileUrl,
              fileSizeBytes: doc.fileSizeBytes,
              order: doc.order,
              active: doc.active,
            })),
          }}
        />
      </div>
    </div>
  );
}
