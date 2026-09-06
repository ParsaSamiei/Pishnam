import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductTagForm } from "@/components/admin/product-tag-form";
import { updateProductTag } from "../../actions";

export default async function EditProductTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tag = await prisma.productTag.findUnique({ where: { id } });

  if (!tag) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/product-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به انواع محصول
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش نوع محصول</h1>
      <div className="mt-6">
        <ProductTagForm
          action={updateProductTag.bind(null, id)}
          defaultValues={tag}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
