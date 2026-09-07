import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductCard } from "@/components/products/product-card";
import { buildAlternates } from "@/lib/i18n/alternates";
import { formatProductPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "محصولات" : "Products",
    description:
      locale === "fa"
        ? "کیت‌ها، ربات‌ها و محصولات آموزشی پیشنام."
        : "Pishnam educational kits, robots, and products.",
    alternates: buildAlternates("/products"),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const { tag: tagParam } = await searchParams;

  const [tags, products] = await Promise.all([
    prisma.productTag.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        tags: {
          where: { tag: { active: true } },
          orderBy: { tag: { order: "asc" } },
          include: { tag: true },
        },
      },
    }),
  ]);

  const activeSlug = tagParam && tags.some((tag) => tag.slug === tagParam) ? tagParam : undefined;

  const filtered = activeSlug
    ? products.filter((product) =>
        product.tags.some((assignment) => assignment.tag.slug === activeSlug),
      )
    : products;

  return (
    <>
      <PageHeader
        title={isFa ? "محصولات" : "Products"}
        subtitle={
          isFa
            ? "کیت‌ها، ربات‌ها و ابزارهایی که در مسیر آموزش و مسابقه پیشنام ساخته یا ارائه می‌شوند."
            : "Kits, robots, and tools built or offered along Pishnam’s learning and competition path."
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {tags.length > 0 ? (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={isFa ? "فیلتر بر اساس نوع" : "Filter by type"}
          >
            <Link
              href="/products"
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !activeSlug
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                  : "border-border text-text-secondary hover:bg-bg-surface-alt",
              )}
            >
              {isFa ? "همه" : "All"}
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={{ pathname: "/products", query: { tag: tag.slug } }}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  activeSlug === tag.slug
                    ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                    : "border-border text-text-secondary hover:bg-bg-surface-alt",
                )}
              >
                {pickLocaleField(tag.nameFa, tag.nameEn, appLocale)}
              </Link>
            ))}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div
            className={cn(
              "border-border bg-bg-surface-alt/40 mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center",
              tags.length > 0 && "mt-10",
            )}
          >
            <Package className="text-pishnam-gold-600 size-10" aria-hidden="true" />
            <p className="text-text-primary mt-4 text-lg font-bold">
              {isFa ? "به‌زودی" : "Coming soon"}
            </p>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">
              {activeSlug
                ? isFa
                  ? "در این دسته هنوز محصولی منتشر نشده است."
                  : "No products in this category yet."
                : isFa
                  ? "هنوز محصولی در ویترین قرار نگرفته است. به‌زودی اینجا معرفی می‌شوند."
                  : "Nothing in the showcase yet. Products will appear here soon."}
            </p>
          </div>
        ) : (
          <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", tags.length > 0 && "mt-8")}>
            {filtered.map((product) => (
              <li key={product.id}>
                <ProductCard
                  slug={product.slug}
                  title={pickLocaleField(product.titleFa, product.titleEn, appLocale)}
                  excerpt={pickLocaleField(product.excerptFa, product.excerptEn, appLocale) ?? ""}
                  image={product.image}
                  price={formatProductPrice(
                    product.price,
                    appLocale,
                    pickLocaleField(product.currencyFa, product.currencyEn, appLocale),
                  )}
                  tags={product.tags.map((assignment) =>
                    pickLocaleField(assignment.tag.nameFa, assignment.tag.nameEn, appLocale),
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
