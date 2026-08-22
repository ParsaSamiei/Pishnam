import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { HeroShowcase } from "./hero-showcase";

export async function HeroSection() {
  const t = await getTranslations("home.hero");
  const locale = (await getLocale()) as AppLocale;

  // Same ordering the /admin/hero-slides table lists them in, so the admin sees
  // the sequence visitors will scroll through.
  const rows = await prisma.heroSlide.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  // Whoever uploaded a photo is the only one who can describe it, so their alt
  // text wins; the generic message is the floor, not the default, and an alt
  // written for the other locale only still beats leaving this one empty.
  const slides = rows.map((slide) => ({
    id: slide.id,
    image: slide.image,
    alt:
      pickLocaleField(slide.altFa, slide.altEn, locale) ??
      slide.altFa ??
      slide.altEn ??
      t("imageAlt"),
  }));

  return (
    <section data-spine-node className="bg-bg-page text-text-primary relative overflow-hidden">
      {/* Subtle circuit-style backdrop -- purposeful color blocking per
          docs/03-design-system.md rather than a busy illustration. Drifts on
          scroll and routes a gold trace on load; see components/motion/
          hero-backdrop.tsx. */}
      <HeroBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Two columns rather than one: the copy keeps roughly its old measure
            (7 of 12 ≈ the max-w-2xl it had), and the navy that used to sit
            empty beside it now carries the showcase. DOM order is copy-then-
            visual and the grid flows along the inline axis, so Persian gets
            copy on the right and English gets it on the left with no reorder. */}
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Above the fold, so this sequence runs on mount rather than waiting
              for a scroll trigger that would never fire. */}
          <StaggerGroup
            className="max-w-2xl lg:col-span-7 lg:max-w-none"
            trigger="mount"
            delayChildren={0.15}
          >
            <StaggerItem variant="rise">
              <span className="bg-pishnam-gold-500/12 text-pishnam-gold-500 ring-pishnam-gold-500/25 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset">
                {/* The board is powered -- same idea as the live via in
                    CircuitBackground, and `motion-safe` so it holds still for
                    anyone who asked for reduced motion. */}
                <span
                  aria-hidden="true"
                  className="bg-pishnam-gold-500 size-1.5 rounded-full motion-safe:animate-pulse"
                />
                {t("eyebrow")}
              </span>
            </StaggerItem>
            <StaggerItem variant="heading">
              {/* `text-balance` evens the ragged wrap -- the Persian title used
                  to drop its last two words onto a line of their own. */}
              <h1 className="mt-5 text-3xl leading-[1.25] font-extrabold text-balance sm:text-4xl lg:text-5xl">
                {t.rich("title", {
                  accent: (chunks) => <span className="text-pishnam-gold-500">{chunks}</span>,
                })}
              </h1>
            </StaggerItem>
            <StaggerItem variant="rise">
              <p className="text-text-secondary mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
                {t("subtitle")}
              </p>
            </StaggerItem>
            <StaggerItem variant="rise">
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="group">
                  <Link href="/courses">
                    {t("ctaPrimary")}
                    {/* Points and travels toward the inline end: mirrored by
                        `-scale-x-100` in RTL, and the nudge is signed to match,
                        since CSS applies `translate` outside `scale` and would
                        otherwise send it backwards. */}
                    <ArrowRight
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
                  <Link href="/enroll">
                    {t("ctaSecondary")}
                    <ArrowRight
                      aria-hidden="true"
                      className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 rtl:-scale-x-100 motion-safe:rtl:group-hover:-translate-x-1"
                    />
                  </Link>
                </Button>
              </div>
            </StaggerItem>
          </StaggerGroup>

          {/* Its own group, offset to land after the copy has finished. Nested
              inside the grid rather than the copy's group on purpose: a
              `StaggerItem` inherits its parent's schedule, and the panel wants
              a beat of its own, not the next slot in the cascade.

              Capped below `lg`, where the columns stack: at full width a 4:3
              panel is 540px tall on a tablet and turns the hero into two
              screens of scrolling before the first card. */}
          <StaggerGroup
            className="w-full max-w-md lg:col-span-5 lg:max-w-none"
            trigger="mount"
            delayChildren={0.5}
          >
            <StaggerItem variant="card">
              <HeroShowcase slides={slides} />
            </StaggerItem>
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
