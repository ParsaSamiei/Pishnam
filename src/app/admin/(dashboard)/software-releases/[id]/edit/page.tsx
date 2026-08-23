import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SoftwareReleaseForm } from "@/components/admin/software-release-form";
import { updateSoftwareRelease } from "../../actions";

export default async function EditSoftwareReleasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [release, products] = await Promise.all([
    prisma.softwareRelease.findUnique({ where: { id } }),
    prisma.softwareProduct.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!release) {
    notFound();
  }

  const boundUpdate = updateSoftwareRelease.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/software-releases"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به فایل‌های نرم‌افزار
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش فایل</h1>
      <div className="mt-6">
        <SoftwareReleaseForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          products={products.map((p) => ({ id: p.id, title: p.titleFa }))}
          defaultValues={release}
        />
      </div>
    </div>
  );
}
