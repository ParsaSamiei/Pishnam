import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Download, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { buildAlternates } from "@/lib/i18n/alternates";
import { POSTERS_DOWNLOAD_TILE } from "@/lib/download-categories";
import { formatFileSize } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    alternates: buildAlternates("/downloads/posters"),
    title: isFa ? POSTERS_DOWNLOAD_TILE.labelFa : POSTERS_DOWNLOAD_TILE.labelEn,
  };
}

export default async function CompetitionPostersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ competition?: string; league?: string }>;
}) {
  const { locale } = await params;
  const { competition: competitionSlug, league: leagueSlug } = await searchParams;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const competitions = await prisma.competition.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      leagues: {
        where: { active: true },
        orderBy: { order: "asc" },
        include: {
          categories: {
            where: { active: true },
            orderBy: { order: "asc" },
            include: {
              posters: {
                where: { active: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  // Drop empty branches so filters only offer competitions/leagues that have posters.
  const competitionsWithPosters = competitions
    .map((competition) => ({
      ...competition,
      leagues: competition.leagues
        .map((league) => ({
          ...league,
          categories: league.categories.filter((category) => category.posters.length > 0),
        }))
        .filter((league) => league.categories.length > 0),
    }))
    .filter((competition) => competition.leagues.length > 0);

  if (competitionSlug && !competitionsWithPosters.some((c) => c.slug === competitionSlug)) {
    notFound();
  }

  const selectedCompetition =
    competitionsWithPosters.find((c) => c.slug === competitionSlug) ??
    competitionsWithPosters[0] ??
    null;

  if (
    selectedCompetition &&
    leagueSlug &&
    !selectedCompetition.leagues.some((l) => l.slug === leagueSlug)
  ) {
    notFound();
  }

  const selectedLeague =
    selectedCompetition?.leagues.find((l) => l.slug === leagueSlug) ??
    selectedCompetition?.leagues[0] ??
    null;

  return (
    <>
      <PageHeader
        title={isFa ? POSTERS_DOWNLOAD_TILE.labelFa : POSTERS_DOWNLOAD_TILE.labelEn}
        subtitle={
          isFa
            ? "پوسترهای مسابقات رباتیک، دسته‌بندی‌شده بر اساس مسابقه، لیگ و موضوع."
            : "Competition posters grouped by competition, league, and category."
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {competitionsWithPosters.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "هنوز پوستری ثبت نشده است." : "No posters have been added yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-2">
              {competitionsWithPosters.map((competition) => {
                const isActive = competition.id === selectedCompetition?.id;
                return (
                  <Link
                    key={competition.id}
                    href={`/downloads/posters?competition=${competition.slug}`}
                    className={cn(
                      "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-pishnam-gold-500 text-pishnam-navy-900"
                        : "bg-bg-surface-alt text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {pickLocaleField(competition.titleFa, competition.titleEn, appLocale)}
                    {competition.year ? ` ${competition.year}` : ""}
                  </Link>
                );
              })}
            </div>

            {selectedCompetition && selectedCompetition.leagues.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {selectedCompetition.leagues.map((league) => {
                  const isActive = league.id === selectedLeague?.id;
                  return (
                    <Link
                      key={league.id}
                      href={`/downloads/posters?competition=${selectedCompetition.slug}&league=${league.slug}`}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "border-pishnam-gold-500 text-text-primary bg-pishnam-gold-500/10"
                          : "border-border text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {pickLocaleField(league.titleFa, league.titleEn, appLocale)}
                    </Link>
                  );
                })}
              </div>
            )}

            {selectedLeague && (
              <div className="flex flex-col gap-10">
                {selectedLeague.categories.map((category) => (
                  <section key={category.id} className="flex flex-col gap-4">
                    <h2 className="text-text-primary text-xl font-bold">
                      {pickLocaleField(category.titleFa, category.titleEn, appLocale)}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {category.posters.map((poster) => {
                        const isExternal = poster.source === "EXTERNAL";
                        return (
                          <TiltCard key={poster.id} tilt={false}>
                            <Card className={cn("overflow-hidden p-0", cardHoverClass)}>
                              <CardHoverRule />
                              <div className="bg-bg-surface-alt relative aspect-3/4">
                                <Image
                                  src={poster.previewImage}
                                  alt={pickLocaleField(poster.titleFa, poster.titleEn, appLocale)}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              </div>
                              <CardContent className="flex flex-col gap-3 p-4">
                                <div>
                                  <p className="text-text-primary font-bold">
                                    {pickLocaleField(poster.titleFa, poster.titleEn, appLocale)}
                                  </p>
                                  {(poster.descriptionFa || poster.descriptionEn) && (
                                    <p className="text-text-secondary mt-1 line-clamp-2 text-sm">
                                      {pickLocaleField(
                                        poster.descriptionFa,
                                        poster.descriptionEn,
                                        appLocale,
                                      )}
                                    </p>
                                  )}
                                  {!isExternal && poster.fileSizeBytes ? (
                                    <p className="text-text-secondary mt-1 text-xs">
                                      {formatFileSize(poster.fileSizeBytes)}
                                    </p>
                                  ) : null}
                                </div>
                                <a
                                  href={poster.fileUrl}
                                  target={isExternal ? "_blank" : undefined}
                                  rel={isExternal ? "noopener noreferrer" : undefined}
                                  download={!isExternal}
                                  className="bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors"
                                >
                                  {isExternal ? (
                                    <ExternalLink className="size-4" aria-hidden="true" />
                                  ) : (
                                    <Download className="size-4" aria-hidden="true" />
                                  )}
                                  {isExternal
                                    ? isFa
                                      ? "مشاهده"
                                      : "Visit"
                                    : isFa
                                      ? "دانلود"
                                      : "Download"}
                                </a>
                              </CardContent>
                            </Card>
                          </TiltCard>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
