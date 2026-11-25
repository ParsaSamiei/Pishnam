import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import { buildAlternates } from "@/lib/i18n/alternates";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { MediaMentionItem } from "@/components/press/media-mention-item";
import { MediaMentionPanel } from "@/components/press/media-mention-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === "fa";
  return {
    alternates: buildAlternates("/press"),
    title: isFa ? "پیشنام در رسانه" : "Pishnam in the Media",
    description: isFa
      ? "گزارش‌ها و خبرهای رسانه‌ای درباره پیشنام."
      : "Press coverage and media reports about Pishnam.",
  };
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const t = await getTranslations({ locale, namespace: "press" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const mentions = await prisma.mediaMention.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
  });

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {mentions.length === 0 ? (
          <p className="text-text-secondary text-center">{t("empty")}</p>
        ) : (
          <StaggerGroup className="mx-auto max-w-3xl">
            <StaggerItem>
              <MediaMentionPanel>
                {mentions.map((mention) => (
                  <MediaMentionItem
                    key={mention.id}
                    outletName={pickLocaleField(
                      mention.outletNameFa,
                      mention.outletNameEn,
                      appLocale,
                    )}
                    headline={pickLocaleField(mention.headlineFa, mention.headlineEn, appLocale)}
                    url={mention.url}
                    logo={mention.logo}
                    publishedAt={mention.publishedAt}
                    locale={appLocale}
                    opensInNewTabLabel={tNav("opensInNewTab")}
                    readLabel={t("read")}
                  />
                ))}
              </MediaMentionPanel>
            </StaggerItem>
          </StaggerGroup>
        )}
      </div>
    </>
  );
}
