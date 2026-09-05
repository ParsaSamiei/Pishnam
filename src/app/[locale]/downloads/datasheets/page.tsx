import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { DATASHEETS_DOWNLOAD_TILE } from "@/lib/download-categories";
import { PageHeader } from "@/components/layout/page-header";
import { DatasheetCatalog } from "@/components/datasheets/datasheet-catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    alternates: buildAlternates("/downloads/datasheets"),
    title: isFa ? DATASHEETS_DOWNLOAD_TILE.labelFa : DATASHEETS_DOWNLOAD_TILE.labelEn,
    description: isFa
      ? "دیتاشیت، پین‌اوت، ویدیو و نمونه کد قطعات مورد استفاده در دوره‌ها و مسابقات پیشنام."
      : "Datasheets, pinouts, videos, and example code for parts used in Pishnam courses and competitions.",
  };
}

export default async function DatasheetsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const parts = await prisma.datasheetPart.findMany({
    where: { active: true, parentId: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { children: { where: { active: true } } } } },
  });

  return (
    <>
      <PageHeader
        title={isFa ? DATASHEETS_DOWNLOAD_TILE.labelFa : DATASHEETS_DOWNLOAD_TILE.labelEn}
        subtitle={
          isFa
            ? "قطعه را پیدا کنید، دیتاشیت را بردارید، و نمونه کد را روی برد بزنید."
            : "Find the part, grab the datasheet, and drop the example onto the board."
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {parts.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "هنوز قطعه‌ای ثبت نشده است." : "No parts have been added yet."}
          </p>
        ) : (
          <DatasheetCatalog
            isFa={isFa}
            parts={parts.map((part) => ({
              slug: part.slug,
              title: pickLocaleField(part.titleFa, part.titleEn, appLocale),
              excerpt: pickLocaleField(part.excerptFa, part.excerptEn, appLocale) ?? "",
              image: part.image,
              badge:
                part._count.children > 0
                  ? isFa
                    ? `${part._count.children} مدل`
                    : `${part._count.children} variants`
                  : isFa
                    ? "ماژول"
                    : "Module",
            }))}
          />
        )}
      </div>
    </>
  );
}
