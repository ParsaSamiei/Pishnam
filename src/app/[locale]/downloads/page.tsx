import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { getActiveDownloadSectionTiles, downloadSectionTitle } from "@/lib/download-sections";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass, cardHoverIconClass } from "@/components/motion/card-hover";
import { animatedLinkIconClass } from "@/components/motion/animated-link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/routing";

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
  const appLocale = locale as AppLocale;
  const isFa = appLocale === "fa";
  const ChevronIcon = isFa ? ChevronLeft : ChevronRight;

  const tiles = await getActiveDownloadSectionTiles();

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
          {tiles.map(({ id, slug, icon: Icon, titleFa, titleEn, count }) => (
            <Link key={id} href={`/downloads/${slug}`} className="block cursor-pointer">
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
                      <p className="text-text-primary font-bold">
                        {downloadSectionTitle({ titleFa, titleEn }, appLocale)}
                      </p>
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
