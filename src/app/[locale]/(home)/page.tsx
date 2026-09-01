import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { HeroSection } from "@/components/home/hero-section";
import { AudienceEntrySection } from "@/components/home/audience-entry-section";
import { RelatedSitesBanner } from "@/components/home/related-sites-banner";
import { AchievementsHighlight } from "@/components/home/achievements-highlight";
import { NewsTeaserSection } from "@/components/home/news-teaser-section";
import { VideosTeaserSection } from "@/components/home/videos-teaser-section";
import { GalleryTeaserSection } from "@/components/home/gallery-teaser-section";
import { DownloadsTeaserSection } from "@/components/home/downloads-teaser-section";
import { ScrollSpine } from "@/components/motion/scroll-spine";
import { FloatingContactButton } from "@/components/home/floating-contact-button";
import { ScrollToTopButton } from "@/components/home/scroll-to-top-button";
import { JsonLd } from "@/components/json-ld";
import { getContactSettings } from "@/lib/contact-settings";
import { getSocialLinks } from "@/lib/social-channels";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "brand" });
  const contact = await getContactSettings();
  const socialLinks = getSocialLinks(contact);
  const sameAs = socialLinks.map((link) => link.href);
  const isFa = locale === "fa";
  const address =
    (isFa ? contact?.addressFa : contact?.addressEn) ||
    (isFa ? contact?.addressEn : contact?.addressFa) ||
    null;
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
          ...(contact?.email ? { email: contact.email } : {}),
          ...(contact?.phones.length ? { telephone: contact.phones } : {}),
          ...(sameAs.length ? { sameAs } : {}),
        }}
      />
      {/* One gold trace, drawn to match scroll depth, threads the sections
          below into a single page -- each section marks its own seam with
          `data-spine-node`. See components/motion/scroll-spine.tsx. */}
      <ScrollSpine>
        <HeroSection />
        <AudienceEntrySection />
        <RelatedSitesBanner />
        <AchievementsHighlight />
        <NewsTeaserSection />
        <VideosTeaserSection />
        <GalleryTeaserSection />
        <DownloadsTeaserSection />
      </ScrollSpine>
      <div className="fixed inset-e-4 bottom-6 z-30 flex flex-col items-center gap-3 sm:inset-e-6">
        <FloatingContactButton
          address={address}
          phones={contact?.phones ?? []}
          socialLinks={socialLinks}
        />
        <ScrollToTopButton />
      </div>
    </>
  );
}
