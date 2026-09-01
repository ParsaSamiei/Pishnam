import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { AnimatedLink } from "@/components/motion/animated-link";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { GalleryCarousel } from "@/components/gallery/gallery-carousel";
import { toGalleryLightboxItem } from "@/lib/gallery";

export async function GalleryTeaserSection() {
  const t = await getTranslations("home.gallery");
  const tHero = await getTranslations("home.hero");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;
  const fallbackAlt = tHero("imageAlt");

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take: 8,
  });

  if (images.length === 0) return null;

  const slides = images.map((image) =>
    toGalleryLightboxItem(image, {
      alt: pickLocaleField(image.altFa, image.altEn, locale) ?? fallbackAlt,
      caption: pickLocaleField(image.captionFa, image.captionEn, locale),
    }),
  );

  return (
    <section data-spine-node className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <StaggerGroup>
            <StaggerItem variant="heading">
              <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            </StaggerItem>
            <StaggerItem variant="rise">
              <p className="text-text-secondary mt-2">{t("subtitle")}</p>
            </StaggerItem>
          </StaggerGroup>
          <Reveal delay={0.2}>
            <AnimatedLink href="/gallery" icon={<ArrowIcon aria-hidden="true" />}>
              {t("viewAll")}
            </AnimatedLink>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-8">
          <GalleryCarousel items={slides} />
        </Reveal>
      </div>
    </section>
  );
}
