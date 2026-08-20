import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { HeroSection } from "@/components/home/hero-section";
import { AudienceEntrySection } from "@/components/home/audience-entry-section";
import { AchievementsHighlight } from "@/components/home/achievements-highlight";
import { NewsTeaserSection } from "@/components/home/news-teaser-section";
import { VideosTeaserSection } from "@/components/home/videos-teaser-section";
import { DownloadsTeaserSection } from "@/components/home/downloads-teaser-section";
import { JsonLd } from "@/components/json-ld";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "brand" });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: t("fullName"),
          url: siteUrl,
          logo: `${siteUrl}/brand/pishnam-logo.png`,
        }}
      />
      <HeroSection />
      <AudienceEntrySection />
      <AchievementsHighlight />
      <NewsTeaserSection />
      <VideosTeaserSection />
      <DownloadsTeaserSection />
    </>
  );
}
