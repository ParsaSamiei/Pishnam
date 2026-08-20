import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { TIERS, TIER_LABELS, type TierValue } from "@/lib/tier-labels";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { VideoEmbedCard } from "@/components/home/video-embed-card";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/videos"),
    title: locale === "fa" ? "ویدیوهای آموزشی" : "Educational Videos",
    description:
      locale === "fa"
        ? "گزیده‌ای از محتوای آموزشی پیشنام در آپارات."
        : "A curated selection of Pishnam's educational Aparat content.",
  };
}

function isTierValue(value: string | undefined): value is TierValue {
  return Boolean(value) && (TIERS as readonly string[]).includes(value as string);
}

export default async function VideosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const { tier: tierParam } = await searchParams;
  const activeTier = isTierValue(tierParam) ? tierParam : undefined;

  const videos = await prisma.videoEntry.findMany({
    where: activeTier ? { tierTags: { has: activeTier } } : undefined,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title={isFa ? "ویدیوهای آموزشی" : "Educational Videos"}
        subtitle={
          isFa
            ? "محتوای آموزشی پیشنام در آپارات، دسته‌بندی‌شده بر اساس سطح و موضوع."
            : "Pishnam's Aparat content, organized by tier and topic."
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={isFa ? "فیلتر بر اساس مقطع" : "Filter by tier"}
        >
          <Link
            href="/videos"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !activeTier
                ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                : "border-border text-text-secondary hover:bg-bg-surface-alt",
            )}
          >
            {isFa ? "همه ویدیوها" : "All videos"}
          </Link>
          {TIERS.map((tierValue) => (
            <Link
              key={tierValue}
              href={{ pathname: "/videos", query: { tier: tierValue } }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeTier === tierValue
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                  : "border-border text-text-secondary hover:bg-bg-surface-alt",
              )}
            >
              {TIER_LABELS[appLocale][tierValue]}
            </Link>
          ))}
        </div>

        {videos.length === 0 ? (
          <p className="text-text-secondary mt-10 text-center">
            {isFa ? "ویدیویی در این دسته یافت نشد." : "No videos found in this category."}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoEmbedCard
                key={video.id}
                title={pickLocaleField(video.titleFa, video.titleEn, appLocale)}
                aparatUrl={video.aparatUrl}
                thumbnail={video.thumbnail}
                topicTags={video.topicTags}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
