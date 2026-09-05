import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { getDatasheetVariant } from "@/lib/datasheet-parts";
import { Link } from "@/lib/i18n/navigation";
import { DatasheetContent } from "@/components/datasheets/datasheet-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; variant: string }>;
}): Promise<Metadata> {
  const { locale, slug, variant } = await params;
  const appLocale = locale as AppLocale;
  const result = await getDatasheetVariant(slug, variant);
  if (!result) return {};

  const title = pickLocaleField(result.variant.titleFa, result.variant.titleEn, appLocale);
  const description =
    pickLocaleField(result.variant.excerptFa, result.variant.excerptEn, appLocale) ?? undefined;

  return {
    alternates: buildAlternates(`/downloads/datasheets/${slug}/${variant}`),
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: result.variant.image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [result.variant.image],
    },
  };
}

export default async function DatasheetVariantPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; variant: string }>;
}) {
  const { locale, slug, variant } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const result = await getDatasheetVariant(slug, variant);
  if (!result) {
    notFound();
  }

  const parentTitle = pickLocaleField(result.parent.titleFa, result.parent.titleEn, appLocale);
  const variantTitle = pickLocaleField(result.variant.titleFa, result.variant.titleEn, appLocale);

  return (
    <>
      <nav
        aria-label={isFa ? "مسیر صفحه" : "Breadcrumb"}
        className="bg-pishnam-navy-900/95 text-pishnam-off-white/70 border-b border-white/10"
      >
        <ol className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
          <li>
            <Link
              href="/downloads/datasheets"
              className="hover:text-pishnam-gold-500 cursor-pointer transition-colors duration-200"
            >
              {isFa ? "دیتاشیت و مستندات" : "Datasheets & Docs"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/downloads/datasheets/${result.parent.slug}`}
              className="hover:text-pishnam-gold-500 cursor-pointer transition-colors duration-200"
            >
              {parentTitle}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-pishnam-off-white">{variantTitle}</li>
        </ol>
      </nav>

      <DatasheetContent
        part={result.variant}
        locale={appLocale}
        eyebrow={isFa ? "دیتاشیت" : "Datasheet"}
      />
    </>
  );
}
