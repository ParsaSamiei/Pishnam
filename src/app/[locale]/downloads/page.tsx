import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  DOWNLOAD_CATEGORIES,
  POSTERS_DOWNLOAD_TILE,
  SOFTWARE_DOWNLOAD_TILE,
} from "@/lib/download-categories";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass, cardHoverIconClass } from "@/components/motion/card-hover";
import { animatedLinkIconClass } from "@/components/motion/animated-link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/downloads"),
    title: locale === "fa" ? "مرکز دانلود" : "Download Center",
    description:
      locale === "fa"
        ? "نرم‌افزار، دیتاشیت، کتاب، پوستر مسابقات و کتابخانه قطعات — رایگان و بدون نیاز به ثبت‌نام."
        : "Software, datasheets, books, competition posters, and part libraries — free, no sign-up required.",
  };
}

export default async function DownloadsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";
  const ChevronIcon = isFa ? ChevronLeft : ChevronRight;

  const [counts, softwareCount, postersCount] = await Promise.all([
    prisma.downloadResource.groupBy({ by: ["category"], _count: true }),
    prisma.softwareProduct.count({ where: { active: true } }),
    prisma.competitionPoster.count({ where: { active: true } }),
  ]);
  const countByCategory = new Map<string, number>(counts.map((c) => [c.category, c._count]));

  // Software & posters have dedicated models (richer than flat DownloadResource),
  // so they aren't part of DOWNLOAD_CATEGORIES/downloadResource counts -- they're
  // prepended here to keep a stable tile order for visitors.
  const tiles = [
    {
      slug: SOFTWARE_DOWNLOAD_TILE.slug,
      icon: SOFTWARE_DOWNLOAD_TILE.icon,
      label: isFa ? SOFTWARE_DOWNLOAD_TILE.labelFa : SOFTWARE_DOWNLOAD_TILE.labelEn,
      count: softwareCount,
    },
    {
      slug: POSTERS_DOWNLOAD_TILE.slug,
      icon: POSTERS_DOWNLOAD_TILE.icon,
      label: isFa ? POSTERS_DOWNLOAD_TILE.labelFa : POSTERS_DOWNLOAD_TILE.labelEn,
      count: postersCount,
    },
    ...DOWNLOAD_CATEGORIES.map((category) => ({
      slug: category.slug,
      icon: category.icon,
      label: isFa ? category.labelFa : category.labelEn,
      count: countByCategory.get(category.value) ?? 0,
    })),
  ];

  return (
    <>
      <PageHeader
        title={isFa ? "مرکز دانلود" : "Download Center"}
        subtitle={
          isFa
            ? "نرم‌افزار، دیتاشیت، کتاب، پوستر مسابقات و کتابخانه قطعات — همه رایگان و بدون نیاز به ثبت‌نام."
            : "Software, datasheets, books, competition posters, and part libraries — all free, no sign-up required."
        }
      />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          {tiles.map(({ slug, icon: Icon, label, count }) => (
            <Link key={slug} href={`/downloads/${slug}`} className="block cursor-pointer">
              <TiltCard tilt={false}>
                <Card className={cardHoverClass}>
                  <CardHoverRule />
                  <CardContent className="flex items-center gap-4 p-5">
                    <div
                      className={cn(
                        "bg-pishnam-steel-600/15 text-pishnam-steel-600 flex size-11 shrink-0 items-center justify-center rounded-lg",
                        cardHoverIconClass,
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary font-bold">{label}</p>
                      <p className="text-text-secondary text-xs">
                        {count} {isFa ? "مورد" : "items"}
                      </p>
                    </div>
                    <ChevronIcon
                      className={cn("text-text-secondary size-5", animatedLinkIconClass)}
                      aria-hidden="true"
                    />
                  </CardContent>
                </Card>
              </TiltCard>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
