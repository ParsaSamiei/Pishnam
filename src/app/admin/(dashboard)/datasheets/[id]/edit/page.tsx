import Link from "next/link";
import { ArrowRight, Pencil, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatasheetPartForm } from "@/components/admin/datasheet-part-form";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { updateDatasheetPart, deleteDatasheetPart } from "../../actions";

export default async function EditDatasheetPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const part = await prisma.datasheetPart.findUnique({
    where: { id },
    include: {
      children: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      documents: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      videos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      images: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      codeSamples: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!part || part.parentId) {
    notFound();
  }

  const boundUpdate = updateDatasheetPart.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/datasheets"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دیتاشیت و قطعات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش قطعه</h1>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-text-primary text-sm font-bold">زیرقطعه‌ها</h2>
            <p className="text-text-secondary mt-1 text-xs">
              برای خانواده‌هایی مثل LCD. اگر این ماژول تکی است، این بخش را خالی بگذارید.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/admin/datasheets/${id}/variants/new`}>
              <Plus className="size-4" aria-hidden="true" />
              افزودن زیرقطعه
            </Link>
          </Button>
        </div>
        <Card className="overflow-hidden p-0">
          <DataTable
            rows={part.children}
            getRowKey={(row) => row.id}
            emptyMessage="زیرقطعه‌ای ثبت نشده — این قطعه به‌صورت ماژول تکی نمایش داده می‌شود."
            columns={[
              {
                header: "عنوان",
                cell: (row) => (
                  <div>
                    <p className="font-medium">{row.titleFa}</p>
                    <p className="text-text-secondary text-xs" dir="ltr">
                      /downloads/datasheets/{part.slug}/{row.slug}
                    </p>
                  </div>
                ),
              },
              {
                header: "وضعیت",
                cell: (row) => (row.active ? "فعال" : "غیرفعال"),
                className: "text-text-secondary",
              },
              {
                header: "",
                className: "w-24 text-end",
                cell: (row) => (
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/datasheets/${id}/variants/${row.id}/edit`}
                      className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                      aria-label={`ویرایش ${row.titleFa}`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Link>
                    <DeleteButton
                      onDelete={deleteDatasheetPart.bind(null, row.id)}
                      itemLabel={row.titleFa}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </section>

      <div className="mt-10">
        <DatasheetPartForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          defaultValues={{
            slug: part.slug,
            image: part.image,
            titleFa: part.titleFa,
            titleEn: part.titleEn,
            excerptFa: part.excerptFa,
            excerptEn: part.excerptEn,
            bodyFa: part.bodyFa,
            bodyEn: part.bodyEn,
            order: part.order,
            active: part.active,
            documents: part.documents.map((doc) => ({
              titleFa: doc.titleFa,
              titleEn: doc.titleEn,
              descriptionFa: doc.descriptionFa ?? "",
              descriptionEn: doc.descriptionEn ?? "",
              source: doc.source,
              fileUrl: doc.fileUrl,
              fileSizeBytes: doc.fileSizeBytes,
              order: doc.order,
            })),
            videos: part.videos.map((video) => ({
              titleFa: video.titleFa,
              titleEn: video.titleEn,
              source: video.hostedVideo ? "hosted" : "aparat",
              aparatUrl: video.aparatUrl ?? "",
              hostedVideo: video.hostedVideo ?? "",
              thumbnail: video.thumbnail ?? "",
              order: video.order,
            })),
            images: part.images.map((img) => ({
              image: img.image,
              captionFa: img.captionFa ?? "",
              captionEn: img.captionEn ?? "",
              order: img.order,
            })),
            codeSamples: part.codeSamples.map((sample) => ({
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
