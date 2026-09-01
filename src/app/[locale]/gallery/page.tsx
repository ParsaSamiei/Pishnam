import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery.meta" });
  return {
    alternates: buildAlternates("/gallery"),
    title: t("title"),
    description: t("description"),
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const t = await getTranslations("gallery");
  const tHero = await getTranslations("home.hero");
  const fallbackAlt = tHero("imageAlt");

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const items = images.map((image) => ({
    id: image.id,
    image: image.image,
    alt: pickLocaleField(image.altFa, image.altEn, appLocale) ?? fallbackAlt,
    caption: pickLocaleField(image.captionFa, image.captionEn, appLocale),
  }));

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <p className="text-text-secondary text-center">{t("empty")}</p>
        ) : (
          <GalleryGrid items={items} openLabel={t("openPhoto")} />
        )}
      </div>
    </>
  );
}
