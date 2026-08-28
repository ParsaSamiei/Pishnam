import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { SOFTWARE_DOWNLOAD_TILE } from "@/lib/download-categories";
import { PageHeader } from "@/components/layout/page-header";
import { SoftwareProductCard } from "@/components/software/software-product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    alternates: buildAlternates("/downloads/software"),
    title: isFa ? SOFTWARE_DOWNLOAD_TILE.labelFa : SOFTWARE_DOWNLOAD_TILE.labelEn,
  };
}

export default async function SoftwareDownloadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const products = await prisma.softwareProduct.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { releases: true } } },
  });

  return (
    <>
      <PageHeader
        title={isFa ? SOFTWARE_DOWNLOAD_TILE.labelFa : SOFTWARE_DOWNLOAD_TILE.labelEn}
        subtitle={
          isFa
            ? "نرم‌افزارها و افزونه‌های مورد استفاده در دوره‌ها و مسابقات پیشنام، برای ویندوز، مک و سایر پلتفرم‌ها."
            : "Software and plugins used across Pishnam's courses and competitions, for Windows, macOS, and other platforms."
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "هنوز نرم‌افزاری ثبت نشده است." : "No software has been added yet."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <SoftwareProductCard
                key={product.id}
                slug={product.slug}
                title={pickLocaleField(product.titleFa, product.titleEn, appLocale)}
                excerpt={
                  pickLocaleField(product.descriptionFa, product.descriptionEn, appLocale) ?? ""
                }
                image={product.image}
                releaseCount={product._count.releases}
                releaseCountLabel={
                  isFa ? `${product._count.releases} نسخه` : `${product._count.releases} builds`
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
