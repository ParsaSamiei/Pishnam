import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SoftwareProductForm } from "@/components/admin/software-product-form";
import { updateSoftwareProduct } from "../../actions";

export default async function EditSoftwareProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.softwareProduct.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  const boundUpdate = updateSoftwareProduct.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/software"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به نرم‌افزار و افزونه‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش نرم‌افزار</h1>
      <div className="mt-6">
        <SoftwareProductForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          defaultValues={product}
        />
      </div>
    </div>
  );
}
