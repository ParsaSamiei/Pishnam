import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { buildAlternates } from "@/lib/i18n/alternates";
import { ProductContent } from "@/components/products/product-content";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: {
      titleFa: true,
      titleEn: true,
      excerptFa: true,
      excerptEn: true,
      image: true,
    },
  });

  if (!product) {
    return { title: locale === "fa" ? "محصول" : "Product" };
  }

  const appLocale = locale as AppLocale;
  const title = pickLocaleField(product.titleFa, product.titleEn, appLocale);
  const description = pickLocaleField(product.excerptFa, product.excerptEn, appLocale);

  return {
    title,
    description: description || undefined,
    alternates: buildAlternates(`/products/${slug}`),
    openGraph: {
      title,
      description: description || undefined,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      tags: {
        where: { tag: { active: true } },
        orderBy: { tag: { order: "asc" } },
        include: { tag: { select: { nameFa: true, nameEn: true, slug: true } } },
      },
      images: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      videos: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      specs: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      course: {
        include: { translations: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedCourse = product.course?.active ? product.course : null;
  const courseTitleFa =
    relatedCourse?.translations.find((t) => t.locale === "fa")?.title ?? relatedCourse?.slug;
  const courseTitleEn =
    relatedCourse?.translations.find((t) => t.locale === "en")?.title ?? relatedCourse?.slug;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="text-text-secondary hover:text-pishnam-gold-600 inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          {isFa ? "بازگشت به محصولات" : "Back to products"}
        </Link>
      </div>

      <ProductContent
        locale={appLocale}
        product={{
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
          tags: product.tags.map((assignment) => assignment.tag),
          images: product.images,
          videos: product.videos,
          specs: product.specs,
          course:
            relatedCourse && courseTitleFa && courseTitleEn
              ? {
                  slug: relatedCourse.slug,
                  titleFa: courseTitleFa,
                  titleEn: courseTitleEn,
                }
              : null,
        }}
      />
    </>
  );
}
