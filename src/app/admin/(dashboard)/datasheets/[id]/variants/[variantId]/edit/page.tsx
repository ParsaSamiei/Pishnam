import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DatasheetPartForm } from "@/components/admin/datasheet-part-form";
import { updateDatasheetPart } from "../../../../actions";

export default async function EditDatasheetVariantPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id, variantId } = await params;
  const parent = await prisma.datasheetPart.findUnique({
    where: { id },
    select: { id: true, parentId: true, slug: true, titleFa: true },
  });
  if (!parent || parent.parentId) {
    notFound();
  }

  const variant = await prisma.datasheetPart.findUnique({
    where: { id: variantId },
    include: {
      documents: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      videos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      images: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      codeSamples: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!variant || variant.parentId !== parent.id) {
    notFound();
  }

  const boundUpdate = updateDatasheetPart.bind(null, variant.id);

  return (
    <div>
      <Link
        href={`/admin/datasheets/${id}/edit`}
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به {parent.titleFa}
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش زیرقطعه</h1>
      <div className="mt-6">
        <DatasheetPartForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          variant
          parentSlug={parent.slug}
          defaultValues={{
            parentId: parent.id,
            slug: variant.slug,
            image: variant.image,
            titleFa: variant.titleFa,
            titleEn: variant.titleEn,
            excerptFa: variant.excerptFa,
            excerptEn: variant.excerptEn,
            bodyFa: variant.bodyFa,
            bodyEn: variant.bodyEn,
            order: variant.order,
            active: variant.active,
            documents: variant.documents.map((doc) => ({
              titleFa: doc.titleFa,
              titleEn: doc.titleEn,
              descriptionFa: doc.descriptionFa ?? "",
              descriptionEn: doc.descriptionEn ?? "",
              source: doc.source,
              fileUrl: doc.fileUrl,
              fileSizeBytes: doc.fileSizeBytes,
              order: doc.order,
            })),
            videos: variant.videos.map((video) => ({
              titleFa: video.titleFa,
              titleEn: video.titleEn,
              source: video.hostedVideo ? "hosted" : "aparat",
              aparatUrl: video.aparatUrl ?? "",
              hostedVideo: video.hostedVideo ?? "",
              thumbnail: video.thumbnail ?? "",
              order: video.order,
            })),
            images: variant.images.map((img) => ({
              image: img.image,
              captionFa: img.captionFa ?? "",
              captionEn: img.captionEn ?? "",
              order: img.order,
            })),
            codeSamples: variant.codeSamples.map((sample) => ({
              titleFa: sample.titleFa,
              titleEn: sample.titleEn,
              language: sample.language,
              code: sample.code,
              notesFa: sample.notesFa ?? "",
              notesEn: sample.notesEn ?? "",
              source:
                sample.source === "EXTERNAL"
                  ? "EXTERNAL"
                  : sample.source === "HOSTED"
                    ? "HOSTED"
                    : "",
              fileUrl: sample.fileUrl ?? "",
              fileSizeBytes: sample.fileSizeBytes,
              order: sample.order,
            })),
          }}
        />
      </div>
    </div>
  );
}
