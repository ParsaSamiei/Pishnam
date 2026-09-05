import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { getTopLevelDatasheetPart } from "@/lib/datasheet-parts";
import { Link } from "@/lib/i18n/navigation";
import { DatasheetContent } from "@/components/datasheets/datasheet-content";
import { DatasheetPartCard } from "@/components/datasheets/datasheet-part-card";
import { Reveal } from "@/components/motion/reveal";

async function getPart(slug: string) {
  return getTopLevelDatasheetPart(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const part = await getPart(slug);
  if (!part) return {};

  const title = pickLocaleField(part.titleFa, part.titleEn, appLocale);
  const description = pickLocaleField(part.excerptFa, part.excerptEn, appLocale) ?? undefined;

  return {
    alternates: buildAlternates(`/downloads/datasheets/${slug}`),
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: part.image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [part.image],
    },
  };
}

export default async function DatasheetPartPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const part = await getPart(slug);
  if (!part) {
    notFound();
  }

  const isFamily = part.children.length > 0;
  const eyebrow = isFamily
    ? isFa
      ? "خانواده قطعه"
      : "Part family"
    : isFa
      ? "دیتاشیت"
      : "Datasheet";

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
          <li className="text-pishnam-off-white">
            {pickLocaleField(part.titleFa, part.titleEn, appLocale)}
          </li>
        </ol>
      </nav>

      <DatasheetContent part={part} locale={appLocale} eyebrow={eyebrow}>
        {isFamily ? (
          <section className="mt-8" aria-labelledby="datasheet-variants">
            <Reveal from="start">
              <h2 id="datasheet-variants" className="text-text-primary text-lg font-bold">
                {isFa ? "مدل‌ها" : "Variants"}
              </h2>
            </Reveal>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {part.children.map((child) => (
                <li key={child.id}>
                  <DatasheetPartCard
                    href={`/downloads/datasheets/${part.slug}/${child.slug}`}
                    title={pickLocaleField(child.titleFa, child.titleEn, appLocale)}
                    excerpt={pickLocaleField(child.excerptFa, child.excerptEn, appLocale) ?? ""}
                    image={child.image}
                    slug={child.slug}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </DatasheetContent>
    </>
  );
}
