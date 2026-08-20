import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { DOWNLOAD_CATEGORIES } from "@/lib/download-categories";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const ChevronIcon = isFa ? ChevronLeft : ChevronRight;

  const counts = await prisma.downloadResource.groupBy({
    by: ["category"],
    _count: true,
  });
  const countByCategory = new Map<string, number>(counts.map((c) => [c.category, c._count]));

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
          {DOWNLOAD_CATEGORIES.map(({ slug, icon: Icon, labelFa, labelEn, value }) => (
            <Link key={slug} href={`/downloads/${slug}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="bg-pishnam-steel-600/15 text-pishnam-steel-600 flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary font-bold">
                      {appLocale === "fa" ? labelFa : labelEn}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {countByCategory.get(value) ?? 0} {isFa ? "مورد" : "items"}
                    </p>
                  </div>
                  <ChevronIcon className="text-text-secondary size-5" aria-hidden="true" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
