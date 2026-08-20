import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Download, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { getDownloadCategory, downloadCategoryLabel } from "@/lib/download-categories";
import { buildAlternates } from "@/lib/i18n/alternates";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const config = getDownloadCategory(category);
  if (!config) return {};
  return {
    title: downloadCategoryLabel(category, locale as AppLocale),
    alternates: buildAlternates(`/downloads/${category}`),
  };
}

export default async function DownloadCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const config = getDownloadCategory(category);
  if (!config) notFound();

  const resources = await prisma.downloadResource.findMany({
    where: { category: config.value },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title={downloadCategoryLabel(category, appLocale)} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {resources.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "موردی در این دسته موجود نیست." : "No resources in this category yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {resources.map((resource) => {
              const isExternal = resource.source === "EXTERNAL";
              return (
                <Card key={resource.id}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="bg-pishnam-gold-500/15 text-pishnam-gold-600 flex size-11 shrink-0 items-center justify-center rounded-lg">
                      {isExternal ? (
                        <ExternalLink className="size-5" aria-hidden="true" />
                      ) : (
                        <Download className="size-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary font-bold">
                        {pickLocaleField(resource.titleFa, resource.titleEn, appLocale)}
                      </p>
                      {(resource.descriptionFa || resource.descriptionEn) && (
                        <p className="text-text-secondary mt-0.5 line-clamp-2 text-sm">
                          {pickLocaleField(
                            resource.descriptionFa,
                            resource.descriptionEn,
                            appLocale,
                          )}
                        </p>
                      )}
                      <div className="text-text-secondary mt-1 flex flex-wrap gap-2 text-xs">
                        {resource.cadTool && (
                          <span className="bg-bg-surface-alt rounded-full px-2 py-0.5">
                            {resource.cadTool}
                          </span>
                        )}
                        {!isExternal && resource.fileSizeBytes && (
                          <span>{formatFileSize(resource.fileSizeBytes)}</span>
                        )}
                      </div>
                    </div>
                    <a
                      href={resource.fileUrl}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      download={!isExternal}
                      className="bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600 shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      {isExternal ? (isFa ? "مشاهده" : "Visit") : isFa ? "دانلود" : "Download"}
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
