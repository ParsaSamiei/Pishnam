"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";

export interface HeroCarouselSlide {
  id: string;
  /** `/uploads/<uuid>.webp` path from HeroSlide.image. */
  image: string;
  /** Already resolved for the active locale by the server -- see hero-section.tsx. */
  alt: string;
}

/**
 * Keep in sync with the single-photo path in hero-showcase.tsx: the panel is
 * ~46% of a max-w-7xl grid on desktop and the full column below `lg`.
 */
const SIZES = "(min-width: 1024px) 46vw, 100vw";

/**
 * The hero's photo carousel: a CSS scroll-snap track with buttons, dots, and a
 * live region layered over it.
 *
 * Scroll-snap rather than a transform slider, for three reasons that matter
 * here. Touch swipe and trackpad scrolling come from the platform, with real
 * momentum and rubber-banding. RTL is free -- the browser lays the track out
 * along the inline axis, so Persian scrolls right-to-left with no mirrored
 * code path. And it degrades: the track scrolls before any JS loads and even
 * with JS off entirely, which is why the controls hide under
 * `@media (scripting: none)` in styles/globals.css instead of sitting there
 * inert.
 *
 * No autoplay, deliberately: WCAG 2.2.2 requires a pause control for anything
 * that moves for more than five seconds, and a hero that reshuffles itself
 * while someone is reading the headline beside it is worse than one that waits
 * to be asked.
 */
export function HeroCarousel({ slides }: { slides: HeroCarouselSlide[] }) {
  const t = useTranslations("home.hero.carousel");
  const isRtl = useIsRtl();
  const reduceMotion = useReducedMotionSafe();

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Which slide is showing is a fact about scroll position, and the scroll can
  // come from a swipe, a keypress, the scrollbar, or our own buttons. Observing
  // the track is the only reading that covers all four; tracking it from the
  // click handlers alone would leave a swiped carousel with a stale dot.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(Number((entry.target as HTMLElement).dataset.slideIndex));
        }
      },
      // Slides are exactly the width of the track and snapping is mandatory, so
      // a 0.6 threshold can only ever be met by one of them at a time.
      { root: track, threshold: 0.6 },
    );

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [slides.length]);

  const scrollToSlide = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const target = slideRefs.current[index];
      if (!track || !target) return;

      // A *relative* physical delta, measured off the two rects. `scrollLeft`
      // is the trap here: engines disagree on its sign and origin in RTL
      // containers (negative in Blink/Gecko, positive-from-the-right
      // historically in WebKit), so absolute `scrollTo({left})` would need a
      // per-engine correction. The gap between where the slide is and where
      // the track's left edge is means the same thing everywhere.
      const delta = target.getBoundingClientRect().left - track.getBoundingClientRect().left;
      track.scrollBy({ left: delta, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion],
  );

  // Bound to the controls themselves rather than to a wrapper: the buttons and
  // dots are the carousel's tab stops, so arrows work from whichever one has
  // focus -- tab to "next", then hold ArrowRight rather than pressing Enter
  // four times. The track deliberately isn't a tab stop; it would only add a
  // focus target that does what these already do.
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    // Arrow keys follow what the visitor sees, not DOM order: the track runs
    // right-to-left in Persian, so there ArrowLeft advances. This is also what
    // the browser's own arrow-key scrolling would do, so the two agree.
    const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
    const backKey = isRtl ? "ArrowRight" : "ArrowLeft";

    let next: number | null = null;
    if (event.key === forwardKey) next = Math.min(active + 1, slides.length - 1);
    else if (event.key === backKey) next = Math.max(active - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = slides.length - 1;

    if (next === null) return;
    // Home/End would otherwise jump the page to top/bottom.
    event.preventDefault();
    scrollToSlide(next);
  }

  const atStart = active === 0;
  const atEnd = active === slides.length - 1;

  return (
    <div className="absolute inset-0">
      <div
        ref={trackRef}
        // Named as a carousel so a screen-reader user hears that this is one
        // widget with several photos, not a stack of unrelated images.
        role="group"
        aria-roledescription="carousel"
        aria-label={t("label")}
        className={cn(
          "flex h-full snap-x snap-mandatory scrollbar-none overflow-x-auto rounded-2xl",
          // Keeps a swipe past the last photo from bubbling up and scrolling
          // the page sideways (or triggering back-navigation on iOS).
          "overscroll-x-contain",
        )}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            data-slide-index={index}
            role="group"
            aria-roledescription={t("slide")}
            aria-label={t("status", { current: index + 1, total: slides.length })}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              // Only the first one. It is the LCP candidate; preloading the
              // rest would put three or four full-width photos ahead of the
              // fonts and the page's own JS in the queue, to show one.
              priority={index === 0}
              className="object-cover"
              sizes={SIZES}
            />
          </div>
        ))}
      </div>

      {/* Dots carry the position visually, so this is for screen readers only
          -- a second visible counter would just say the same thing twice. */}
      <p aria-live="polite" className="sr-only">
        {t("status", { current: active + 1, total: slides.length })}
      </p>

      {/* `pointer-events-none` on the layer, `auto` on each control: without it
          this overlay would swallow every swipe aimed at the track beneath.
          `z-10` clears the panel's scrim, which hero-showcase.tsx paints over
          the whole frame afterwards -- 70% navy across the gold dots would cost
          them the contrast they were picked for. */}
      <div data-carousel-controls className="pointer-events-none absolute inset-0 z-10">
        <StepButton
          label={t("previous")}
          icon={ChevronLeft}
          atBoundary={atStart}
          onClick={() => scrollToSlide(active - 1)}
          onKeyDown={handleKeyDown}
          className="start-3"
        />
        <StepButton
          label={t("next")}
          icon={ChevronRight}
          atBoundary={atEnd}
          onClick={() => scrollToSlide(active + 1)}
          onKeyDown={handleKeyDown}
          className="end-3"
        />

        {/* A full-width centering strip rather than `start-1/2` plus a
            translate: `translate-x` is physical and would need its own RTL
            sign flip, while `justify-center` is direction-agnostic. */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <div className="relative flex items-center gap-2">
            {/* Backing plate. The dots sit above the panel's scrim, so over a
                blown-out photo the gold would land near 1.3:1 against it --
                short of the 3:1 WCAG 1.4.11 asks of a non-text indicator. This
                puts a floor under it (~3.8:1 worst case). Sized to the dots
                rather than to their 44px targets, so the guarantee doesn't cost
                a chunky 44px chip across the bottom of the photo. */}
            <span
              aria-hidden="true"
              className="bg-pishnam-navy-900/80 pointer-events-none absolute -inset-x-2.5 top-1/2 h-5 -translate-y-1/2 rounded-full backdrop-blur-sm"
            />
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollToSlide(index)}
                onKeyDown={handleKeyDown}
                aria-label={t("goTo", { index: index + 1 })}
                aria-current={index === active ? "true" : undefined}
                // 24x44 around an 8px dot: WCAG 2.5.8 wants 24px on both axes,
                // and the 8px gap means a thumb can land on one without
                // catching two.
                className="focus-visible:outline-pishnam-gold-500 pointer-events-auto relative flex h-11 w-6 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    // Scale, not width -- a transform composites, a width
                    // change relayouts the strip on every slide.
                    "size-2 rounded-full transition duration-200",
                    index === active
                      ? "bg-pishnam-gold-500 motion-safe:scale-125"
                      : "bg-pishnam-off-white/55",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Prev/next. One component for both, so the pair can't drift apart in size,
 * contrast, or focus treatment.
 */
function StepButton({
  label,
  icon: Icon,
  atBoundary,
  onClick,
  onKeyDown,
  className,
}: {
  label: string;
  icon: LucideIcon;
  atBoundary: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  className: string;
}) {
  return (
    <button
      type="button"
      // `aria-disabled`, not `disabled`. The real attribute makes the browser
      // blur the button the moment it goes inert, which breaks the thing it is
      // supposed to protect: hold ArrowLeft to walk back through the photos and
      // focus is dropped to <body> on arrival at the first one, so the next
      // press does nothing and there is no control left to press. Announced as
      // disabled either way; still focusable, so the keys keep working.
      aria-disabled={atBoundary || undefined}
      onClick={() => {
        if (!atBoundary) onClick();
      }}
      onKeyDown={onKeyDown}
      aria-label={label}
      className={cn(
        "pointer-events-auto absolute top-1/2 -translate-y-1/2",
        // 44px, and a dark chip so off-white stays past 4.5:1 even where the
        // photo behind it is blown out.
        "text-pishnam-off-white bg-pishnam-navy-900/80 flex size-11 items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm ring-inset",
        "hover:bg-pishnam-navy-900/90 cursor-pointer transition duration-200 hover:ring-white/40",
        "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        // Hover is suppressed too, so a dimmed button never brightens under the
        // cursor as though it were live.
        "aria-disabled:hover:bg-pishnam-navy-900/80 aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:ring-white/10 aria-disabled:hover:ring-white/10",
        className,
      )}
    >
      {/* Mirrored for Persian, where the track runs the other way -- same
          `rtl:-scale-x-100` the hero's CTA arrow uses. */}
      <Icon className="size-5 rtl:-scale-x-100" aria-hidden="true" />
    </button>
  );
}
