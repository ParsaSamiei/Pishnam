import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DatasheetPartForm } from "@/components/admin/datasheet-part-form";
import { createDatasheetPart } from "../../../actions";

export default async function NewDatasheetVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parent = await prisma.datasheetPart.findUnique({
    where: { id },
    select: { id: true, parentId: true, slug: true, titleFa: true },
  });

  if (!parent || parent.parentId) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/admin/datasheets/${id}/edit`}
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به {parent.titleFa}
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن زیرقطعه</h1>
      <p className="text-text-secondary mt-2 text-sm">
        این صفحه زیرمجموعهٔ «{parent.titleFa}» خواهد بود.
      </p>
      <div className="mt-6">
        <DatasheetPartForm
          action={createDatasheetPart}
          submitLabel="ثبت"
          variant
          parentSlug={parent.slug}
          defaultValues={{
            parentId: parent.id,
            slug: "",
            image: "",
            titleFa: "",
            titleEn: "",
            excerptFa: null,
            excerptEn: null,
            bodyFa: null,
            bodyEn: null,
            order: 0,
            active: true,
          }}
        />
      </div>
    </div>
  );
}
