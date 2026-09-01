import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { AnimatedLink } from "@/components/motion/animated-link";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass, cardHoverIconClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/routing";
import { getActiveDownloadSectionTiles, downloadSectionTitle } from "@/lib/download-sections";

export async function DownloadsTeaserSection() {
  const t = await getTranslations("home.downloads");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;
  const tiles = await getActiveDownloadSectionTiles();

  return (
    <section data-spine-node className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <StaggerGroup>
            <StaggerItem variant="heading">
              <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            </StaggerItem>
            <StaggerItem variant="rise">
              <p className="text-text-secondary mt-2 max-w-xl">{t("subtitle")}</p>
            </StaggerItem>
          </StaggerGroup>
          <Reveal delay={0.2}>
            <AnimatedLink href="/downloads" icon={<ArrowIcon aria-hidden="true" />}>
              {t("viewAll")}
            </AnimatedLink>
          </Reveal>
        </div>

        <StaggerGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tiles.map(({ id, slug, icon: Icon, titleFa, titleEn }) => (
            <StaggerItem key={id} className="h-full">
              <Link href={`/downloads/${slug}`} className="block h-full cursor-pointer">
                {/* Lift only -- five tiles tilting independently reads as noise. */}
                <TiltCard className="h-full" tilt={false}>
                  <Card
                    className={cn("flex h-full flex-col items-start gap-3 p-5", cardHoverClass)}
                  >
                    <CardHoverRule />
                    <div
                      className={cn(
                        "bg-pishnam-steel-600/15 text-pishnam-steel-600 flex size-10 items-center justify-center rounded-lg",
                        cardHoverIconClass,
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-text-primary text-sm font-semibold">
                      {downloadSectionTitle({ titleFa, titleEn }, locale)}
                    </span>
                  </Card>
                </TiltCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
