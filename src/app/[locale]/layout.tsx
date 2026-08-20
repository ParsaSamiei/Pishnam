import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeDirection, type AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { ThemeScript } from "@/components/layout/theme-script";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CircuitBackground } from "@/components/layout/circuit-background";
import { AnalyticsScript } from "@/components/analytics-script";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });

  const description =
    locale === "fa"
      ? "آموزش پیشرونده رباتیک، الکترونیک و هوش مصنوعی برای دانش‌آموزان دبستان تا دبیرستان."
      : "Progressive robotics, electronics, and AI education for students from elementary school through high school.";

  return {
    title: {
      default: t("fullName"),
      template: locale === "fa" ? `%s | پیشنام` : `%s | Pishnam`,
    },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    // Root-layout default: correct for the homepage itself. Every other
    // page's own generateMetadata overrides this with its own path via
    // buildAlternates() -- see lib/i18n/alternates.ts for why a single
    // shared value here would be wrong for anything but "/".
    alternates: buildAlternates(""),
    openGraph: {
      type: "website",
      siteName: t("fullName"),
      title: t("fullName"),
      description,
      locale: locale === "fa" ? "fa_IR" : "en_US",
      // Fallback only -- pages with a real hero/cover image (courses,
      // articles) override this with something more suited to a 1200x630
      // social card. The brand mark is a reasonable default, not an ideal
      // OG banner; consider commissioning a proper wide OG image later.
      images: [{ url: "/brand/pishnam-logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("fullName"),
      description,
      images: ["/brand/pishnam-logo.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale's server components.
  setRequestLocale(locale);

  const dir = localeDirection[locale as AppLocale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <CircuitBackground />
        <NextIntlClientProvider>
          {/* relative + z-10: an explicit stacking context for all page
              content, so it reliably paints above the fixed
              CircuitBackground layer regardless of position/transform used
              deeper in the tree (page sections, sticky header, etc). */}
          <div className="relative z-10 flex flex-1 flex-col">
            <a
              href="#main-content"
              className="focus:bg-pishnam-gold-500 focus:text-pishnam-navy-900 sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
            >
              {locale === "fa" ? "رفتن به محتوای اصلی" : "Skip to main content"}
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
        <AnalyticsScript />
      </body>
    </html>
  );
}
