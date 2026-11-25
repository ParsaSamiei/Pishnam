import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeDirection, type AppLocale } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/i18n/alternates";
import { ThemeScript } from "@/components/layout/theme-script";
import { ThemeReconciler } from "@/components/layout/theme-reconciler";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CircuitBackground } from "@/components/layout/circuit-background";
import { BrandCursor } from "@/components/layout/brand-cursor";
import { AnalyticsScript } from "@/components/analytics-script";
import "@/styles/globals.css";

/**
 * Rendered per request rather than prerendered at build time.
 *
 * Every page under this layout is database-backed, because <SiteFooter />
 * calls getContactSettings(). This app was originally built for Vercel +
 * Neon, where `next build` runs against a live database (hence
 * staticGenerationMaxConcurrency in next.config.ts). Self-hosted, the image
 * is built in GitHub Actions -- see .github/workflows/deploy.yml -- which
 * has no database and cannot reach the production one, so prerendering here
 * would either fail the build or bake placeholder content into the image.
 *
 * The per-request cost is small: getContactSettings is wrapped in
 * unstable_cache (revalidate 3600, plus a tag the admin invalidates), so the
 * footer's query is not repeated on every request. The upside is that admin
 * edits reach visitors immediately instead of waiting on revalidation.
 *
 * Valid because Cache Components is not enabled -- `dynamic` is removed when
 * it is. See node_modules/next/dist/docs/01-app/02-guides/
 * caching-without-cache-components.md, "Route segment config".
 */
export const dynamic = "force-dynamic";

// Inert while `dynamic` is "force-dynamic" (nothing is prerendered), but kept
// so the locale set stays declared in one place and static generation works
// again if this route ever stops depending on the database.
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
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
    },
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

  // Makes the locale available to next-intl's server APIs for this request.
  // (Its usual purpose -- enabling static rendering -- does not apply here;
  // see the `dynamic` note above.)
  setRequestLocale(locale);

  const dir = localeDirection[locale as AppLocale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeReconciler />
        <CircuitBackground />
        <BrandCursor />
        <NextIntlClientProvider>
          {/* relative + z-10: an explicit stacking context for all page
              content, so it reliably paints above the fixed
              CircuitBackground layer regardless of position/transform used
              deeper in the tree (page sections, sticky header, etc). */}
          <div className="relative z-10 flex flex-1 flex-col">
            <a
              href="#main-content"
              className="focus:bg-pishnam-gold-500 focus:text-pishnam-navy-900 sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
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
