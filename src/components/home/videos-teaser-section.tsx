import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { AnimatedLink } from "@/components/motion/animated-link";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { VideoEmbedCard } from "./video-embed-card";

export async function VideosTeaserSection() {
  const t = await getTranslations("home.videos");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  const videos = await prisma.videoEntry.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      titleFa: true,
      titleEn: true,
      aparatUrl: true,
      hostedVideo: true,
      thumbnail: true,
      topicTags: true,
    },
  });

  if (videos.length === 0) return null;

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
            <AnimatedLink href="/videos" icon={<ArrowIcon aria-hidden="true" />}>
              {t("viewAll")}
            </AnimatedLink>
          </Reveal>
        </div>

        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <StaggerItem key={video.id} className="h-full">
              <VideoEmbedCard
                title={pickLocaleField(video.titleFa, video.titleEn, locale)}
                aparatUrl={video.aparatUrl}
                hostedVideo={video.hostedVideo}
                thumbnail={video.thumbnail}
                topicTags={video.topicTags}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
