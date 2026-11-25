import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, tags, courses] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        tags: true,
        images: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        videos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        specs: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      },
    }),
    prisma.productTag.findMany({ orderBy: { order: "asc" } }),
    prisma.course.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { translations: { where: { locale: "fa" } } },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به محصولات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش محصول</h1>
      <div className="mt-6">
        <ProductForm
          action={updateProduct.bind(null, id)}
          tags={tags}
          courses={courses.map((course) => ({
            id: course.id,
            title: course.translations[0]?.title ?? course.slug,
          }))}
          defaultValues={{
            slug: product.slug,
            image: product.image,
            titleFa: product.titleFa,
            titleEn: product.titleEn,
            excerptFa: product.excerptFa,
            excerptEn: product.excerptEn,
            bodyFa: product.bodyFa,
            bodyEn: product.bodyEn,
            price: product.price,
            currencyFa: product.currencyFa,
            currencyEn: product.currencyEn,
            courseId: product.courseId,
            order: product.order,
            active: product.active,
            tagIds: product.tags.map((assignment) => assignment.tagId),
            images: product.images.map((img) => ({
              image: img.image,
              captionFa: img.captionFa ?? "",
              captionEn: img.captionEn ?? "",
              order: img.order,
            })),
            videos: product.videos.map((video) => ({
              titleFa: video.titleFa,
              titleEn: video.titleEn,
              source: video.hostedVideo ? ("hosted" as const) : ("aparat" as const),
              aparatUrl: video.aparatUrl ?? "",
              hostedVideo: video.hostedVideo ?? "",
              thumbnail: video.thumbnail ?? "",
              order: video.order,
            })),
            specs: product.specs.map((spec) => ({
              keyFa: spec.keyFa,
              keyEn: spec.keyEn,
              valueFa: spec.valueFa,
              valueEn: spec.valueEn,
              order: spec.order,
            })),
          }}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
