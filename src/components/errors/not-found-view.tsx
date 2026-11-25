"use client";

import { ArrowLeft, ArrowRight, Home, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { AppLocale } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CircuitBreakIllustration } from "@/components/errors/circuit-break-illustration";

type NotFoundViewProps = {
  locale: AppLocale;
};

export function NotFoundView({ locale }: NotFoundViewProps) {
  const t = useTranslations("notFound");
  const isFa = locale === "fa";
  const ArrowIcon = isFa ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("description")} />

      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <span className="bg-pishnam-gold-500/12 text-pishnam-gold-500 ring-pishnam-gold-500/25 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset">
          <span
            aria-hidden="true"
            className="bg-pishnam-gold-500 size-1.5 rounded-full motion-safe:animate-pulse"
          />
          {t("eyebrow")}
        </span>

        {/* Circuit gap carries the 404 — the break is the error code */}
        <div className="relative mx-auto mt-8 w-full max-w-md sm:max-w-lg">
          <CircuitBreakIllustration />
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-5xl leading-none font-extrabold tracking-tighter select-none sm:text-6xl"
          >
            <span className="text-text-primary">4</span>
            <span className="text-pishnam-gold-500 mx-0.5">0</span>
            <span className="text-text-primary">4</span>
          </p>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="group">
            <Link href="/">
              <Home aria-hidden="true" />
              {t("home")}
              <ArrowIcon
                aria-hidden="true"
                className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 rtl:-scale-x-100 motion-safe:rtl:group-hover:-translate-x-1"
              />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group hover:border-pishnam-gold-500/60 hover:bg-pishnam-gold-500/12 hover:text-pishnam-gold-600"
          >
            <Link href="/contact-us">
              <MessageCircle aria-hidden="true" />
              {t("contact")}
            </Link>
          </Button>
        </div>

        <nav aria-label={t("quickLinksLabel")} className="reading-copy mt-12">
          <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
            {t("quickLinksLabel")}
          </p>
          <ul className="border-border bg-bg-surface mt-3 flex flex-col divide-y rounded-lg border text-start text-sm shadow-sm">
            {(
              [
                { href: "/courses", label: t("courses") },
                { href: "/enroll", label: t("enroll") },
                { href: "/about-us/faq", label: t("faq") },
              ] as const
            ).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-text-primary hover:bg-bg-surface-alt hover:text-pishnam-steel-600 flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-200"
                >
                  <span>{item.label}</span>
                  <ArrowIcon aria-hidden="true" className="text-text-secondary rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
