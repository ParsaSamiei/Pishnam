import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { VideoEmbedCard } from "./video-embed-card";

export async function VideosTeaserSection() {
  const t = await getTranslations("home.videos");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  const videos = await prisma.videoEntry.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  if (videos.length === 0) return null;

  return (
    <section className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            <p className="text-text-secondary mt-2">{t("subtitle")}</p>
          </div>
          <Button asChild variant="link" className="gap-1.5">
            <Link href="/videos">
              {t("viewAll")}
              <ArrowIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoEmbedCard
              key={video.id}
              title={pickLocaleField(video.titleFa, video.titleEn, locale)}
              aparatUrl={video.aparatUrl}
              thumbnail={video.thumbnail}
              topicTags={video.topicTags}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
