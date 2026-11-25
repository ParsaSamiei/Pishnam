import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [tags, courses] = await Promise.all([
    prisma.productTag.findMany({ orderBy: { order: "asc" } }),
    prisma.course.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { translations: { where: { locale: "fa" } } },
    }),
  ]);

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به محصولات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن محصول جدید</h1>
      <div className="mt-6">
        <ProductForm
          action={createProduct}
          tags={tags}
          courses={courses.map((course) => ({
            id: course.id,
            title: course.translations[0]?.title ?? course.slug,
          }))}
          submitLabel="ثبت"
        />
      </div>
    </div>
  );
}
