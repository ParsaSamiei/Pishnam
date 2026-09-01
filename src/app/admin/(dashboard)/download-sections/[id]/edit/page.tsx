import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DownloadSectionForm } from "@/components/admin/download-section-form";
import { updateDownloadSection } from "../../actions";

export default async function EditDownloadSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await prisma.downloadSection.findUnique({ where: { id } });

  if (!section) {
    notFound();
  }

  const boundUpdate = updateDownloadSection.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/download-sections"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به بخش‌های مرکز دانلود
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش بخش</h1>
      <div className="mt-6">
        <DownloadSectionForm
          action={boundUpdate}
          defaultValues={section}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
