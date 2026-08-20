import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DownloadResourceForm } from "@/components/admin/download-resource-form";
import { updateDownloadResource } from "../../actions";

export default async function EditDownloadResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await prisma.downloadResource.findUnique({ where: { id } });

  if (!resource) {
    notFound();
  }

  const boundUpdate = updateDownloadResource.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/downloads"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به مرکز دانلود
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش مورد</h1>
      <div className="mt-6">
        <DownloadResourceForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          defaultValues={resource}
        />
      </div>
    </div>
  );
}
