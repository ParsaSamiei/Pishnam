import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { toGalleryLightboxItem } from "@/lib/gallery";
import { cn } from "@/lib/utils";

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

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const t = await getTranslations("gallery");
  const tHero = await getTranslations("home.hero");
  const fallbackAlt = tHero("imageAlt");
  const { tag: tagParam } = await searchParams;

  const [tags, images] = await Promise.all([
    prisma.galleryTag.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.galleryImage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
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
    ? images.filter((image) => image.tags.some((assignment) => assignment.tag.slug === activeSlug))
    : images;

  const items = filtered.map((image) =>
    toGalleryLightboxItem(image, {
      alt: pickLocaleField(image.altFa, image.altEn, appLocale) ?? fallbackAlt,
      caption: pickLocaleField(image.captionFa, image.captionEn, appLocale),
    }),
  );

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
            <Link
              href="/gallery"
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !activeSlug
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                  : "border-border text-text-secondary hover:bg-bg-surface-alt",
              )}
            >
              {t("filterAll")}
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={{ pathname: "/gallery", query: { tag: tag.slug } }}
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

        {items.length === 0 ? (
          <p className={cn("text-text-secondary text-center", tags.length > 0 && "mt-10")}>
            {activeSlug ? t("emptyFiltered") : t("empty")}
          </p>
        ) : (
          <div className={cn(tags.length > 0 && "mt-8")}>
            <GalleryGrid items={items} openLabel={t("openItem")} />
          </div>
        )}
      </div>
    </>
  );
}
