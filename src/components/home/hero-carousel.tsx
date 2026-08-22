"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { cn } from "@/lib/utils";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";

export interface HeroCarouselSlide {
  id: string;
  /** `/uploads/<uuid>.webp` path from HeroSlide.image. */
  image: string;
  /** Already resolved for the active locale by the server -- see hero-section.tsx. */
  alt: string;
  /**
   * Forward-compatible caption, rendered over the photo when present. Nothing
   * populates these today -- the `HeroSlide` table only has `image`/`altFa`/
   * `altEn` -- but a slide that does carry one (a future "event/course card")
   * renders it without any further changes here. Resolved per-locale the same
   * way `alt` is, so this is a plain string rather than a `titleFa`/`titleEn`
   * pair the caller would have to pick between.
   */
  title?: string;
  description?: string;
}

/**
 * Keep in sync with the single-photo path in hero-showcase.tsx: the panel is
 * ~46% of a max-w-7xl grid on desktop and the full column below `lg`.
 */
const SIZES = "(min-width: 1024px) 46vw, 100vw";

const AUTOPLAY_DELAY_MS = 3500;

/**
 * Multiplied by the slide count to convert Embla's 0..1 scroll progress (one
 * fraction spanning the *whole* track) into a distance measured in whole
 * slide-widths. At `1` a slide reaches its resting scale/opacity exactly as
 * it settles into view and its floor exactly as it leaves -- the right value
 * here specifically because every slide is 100% of the viewport (no partial
 * peek), unlike the multi-item carousels this recipe is usually tuned for.
 */
const TWEEN_FACTOR_BASE = 1;
const TWEEN_MIN_SCALE = 0.92;
const TWEEN_MIN_OPACITY = 0.55;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * The hero's photo carousel: an Embla track (loop, drag, and RTL all native
 * to it) with arrows, dots, a play/pause toggle, and a live region layered
 * over it.
 *
 * Embla rather than the previous CSS scroll-snap track because three of the
 * asks here -- true infinite looping, free mouse-drag (not just touch/
 * trackpad panning), and autoplay -- have no clean native-scroll equivalent.
 * The trade-off: a scroll-snap track kept working with no JS at all (see the
 * `@media (scripting: none)` rule in styles/globals.css); this one shows the
 * first photo static and inert without it, since Embla positions slides with
 * a JS-driven transform rather than native scrolling. `data-carousel-controls`
 * still hides the (non-functional) buttons/dots in that case, same as before.
 */
export function HeroCarousel({ slides }: { slides: HeroCarouselSlide[] }) {
  const t = useTranslations("home.hero.carousel");
  const isRtl = useIsRtl();
  const reduceMotion = useReducedMotionSafe();

  // Read inside tweenScale below, which needs the current value without
  // sitting in that callback's own dependency array (see there for why).
  // Synced via an effect, not a during-render write, and declared ahead of
  // `useEmblaCarousel` so this effect registers -- and so runs -- before its
  // options-diffing effect, which is what could otherwise call `reInit` and
  // fire tweenScale's reduceMotion check against a stale value in the same
  // commit.
  const reduceMotionRef = useRef(reduceMotion);
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  // A fresh object every render is fine -- useEmblaCarousel diffs options by
  // value (see embla-carousel-reactive-utils) and only calls `reInit` when
  // something in here actually changed, e.g. `isRtl` flipping on a language
  // switch or `reduceMotion` changing mid-session.
  const options: EmblaOptionsType = {
    loop: true,
    align: "center",
    direction: isRtl ? "rtl" : "ltr",
    // ~26 frames lands in the 400-600ms range Embla's easing targets; a
    // reduced-motion visitor gets a near-instant snap instead of a slide.
    duration: reduceMotion ? 1 : 26,
  };

  const [viewportRef, emblaApi] = useEmblaCarousel(options);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!reduceMotion);
  const [isInteracting, setIsInteracting] = useState(false);
  // Bumped on every manual arrow/dot navigation so the autoplay effect below
  // tears down and restarts its interval -- otherwise a manual move right
  // before the timer was due would be followed by an autoplay jump a moment
  // later, which reads as the carousel fighting the person using it.
  const [restartKey, setRestartKey] = useState(0);

  const tweenNodesRef = useRef<HTMLElement[]>([]);
  const tweenFactorRef = useRef(0);

  // hero-showcase.tsx only mounts this component for 2+ slides, so this is
  // always true in practice -- kept as a real check rather than an assumption
  // so the component doesn't render dead controls if it's ever reused with a
  // single slide.
  const hasMultipleSlides = slides.length > 1;

  // --- which slide is active ------------------------------------------------
  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    // No priming call here -- `useState(0)` above already matches Embla's
    // default `startIndex`, so the subscription alone keeps it in sync from
    // here on.
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // --- active-slide scale/opacity ------------------------------------------
  // Applied to an inner wrapper per slide, never the slide element Embla's
  // `viewportRef` manages directly: in loop mode Embla itself writes a
  // `transform` straight onto a slide's own node to jump it to the other end
  // of the track (see SlideLooper/Translate in embla-carousel's source) --
  // setting `transform` on that same node here would race that write instead
  // of composing with it.
  const setTweenNodes = useCallback((api: EmblaCarouselType) => {
    tweenNodesRef.current = api
      .slideNodes()
      .map((slideNode) => slideNode.querySelector<HTMLElement>("[data-embla-tween]") ?? slideNode);
  }, []);

  const setTweenFactor = useCallback((api: EmblaCarouselType) => {
    tweenFactorRef.current = TWEEN_FACTOR_BASE * api.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback((api: EmblaCarouselType, eventName?: string) => {
    if (reduceMotionRef.current) {
      // A slide left mid-tween when the OS setting flips shouldn't stay
      // scaled/faded with no way to clear it.
      const nodes = tweenNodesRef.current;
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (!node) continue;
        node.style.transform = "";
        node.style.opacity = "";
      }
      return;
    }

    const engine = api.internalEngine();
    const scrollProgress = api.scrollProgress();
    const slidesInView = api.slidesInView();
    const isScrollEvent = eventName === "scroll";

    for (const [snapIndex, scrollSnap] of api.scrollSnapList().entries()) {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex] ?? [];

      for (const slideIndex of slidesInSnap) {
        // Mid-drag this only needs to run for whatever is actually on
        // screen; letting it skip everything else is what keeps this cheap
        // enough to run on every `scroll` tick.
        if (isScrollEvent && !slidesInView.includes(slideIndex)) continue;

        if (engine.options.loop) {
          for (const loopItem of engine.slideLooper.loopPoints) {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          }
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactorRef.current);
        const node = tweenNodesRef.current[slideIndex];
        if (!node) continue;
        node.style.transform = `scale(${clamp(tweenValue, TWEEN_MIN_SCALE, 1)})`;
        node.style.opacity = `${clamp(tweenValue, TWEEN_MIN_OPACITY, 1)}`;
      }
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);

    return () => {
      emblaApi
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tweenScale)
        .off("scroll", tweenScale)
        .off("slideFocus", tweenScale);
    };
  }, [emblaApi, setTweenNodes, setTweenFactor, tweenScale]);

  // --- autoplay --------------------------------------------------------------
  useEffect(() => {
    if (!emblaApi || reduceMotion || !hasMultipleSlides || !isPlaying || isInteracting) {
      return;
    }

    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_DELAY_MS);
    // `restartKey` isn't read in here -- it's only in the dependency array so
    // a manual arrow/dot navigation (see restartAutoplay below) tears this
    // timer down and starts a fresh one, rather than the interval ticking
    // over on its own original schedule right on the heels of that move.
    return () => clearInterval(id);
  }, [emblaApi, reduceMotion, hasMultipleSlides, isPlaying, isInteracting, restartKey]);

  // Embla only reports pointer activity on the track itself, so a drag pauses
  // autoplay here; a click on a button doesn't fire these and instead bumps
  // `restartKey` via the nav callbacks below.
  useEffect(() => {
    if (!emblaApi) return;
    const onPointerDown = () => setIsInteracting(true);
    const onPointerUp = () => setIsInteracting(false);
    emblaApi.on("pointerDown", onPointerDown).on("pointerUp", onPointerUp);
    return () => {
      emblaApi.off("pointerDown", onPointerDown).off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  const restartAutoplay = useCallback(() => setRestartKey((key) => key + 1), []);

  // --- navigation --------------------------------------------------------------
  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    restartAutoplay();
  }, [emblaApi, restartAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    restartAutoplay();
  }, [emblaApi, restartAutoplay]);

  const goToSlide = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      restartAutoplay();
    },
    [emblaApi, restartAutoplay],
  );

  // Bound to the controls themselves rather than to a wrapper: the buttons
  // and dots are the carousel's tab stops, so arrows work from whichever one
  // has focus -- tab to "next", then hold ArrowRight rather than pressing
  // Enter four times.
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    // Arrow keys follow what the visitor sees, not DOM order: the track runs
    // right-to-left in Persian, so there ArrowLeft advances.
    const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
    const backKey = isRtl ? "ArrowRight" : "ArrowLeft";

    if (event.key === forwardKey) {
      event.preventDefault();
      scrollNext();
    } else if (event.key === backKey) {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "Home") {
      event.preventDefault();
      goToSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goToSlide(slides.length - 1);
    }
  }

  // Pausing on hover covers a mouse; pausing on focus covers keyboard users
  // tabbing through the controls -- neither overlaps with the pointerDown/Up
  // pair above, which covers an actual drag.
  function handleBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsInteracting(false);
    }
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={handleBlurCapture}
    >
      <div
        ref={viewportRef}
        // Named as a carousel so a screen-reader user hears that this is one
        // widget with several photos, not a stack of unrelated images.
        role="group"
        aria-roledescription="carousel"
        aria-label={t("label")}
        // `touch-pan-y` lets a vertical page scroll started on the panel keep
        // working; Embla's own drag handler claims the horizontal axis.
        className="h-full touch-pan-y overflow-hidden rounded-2xl"
      >
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              data-slide-index={index}
              role="group"
              aria-roledescription={t("slide")}
              aria-label={t("status", { current: index + 1, total: slides.length })}
              className="relative h-full w-full shrink-0 grow-0 basis-full"
            >
              {/* The tween target -- see setTweenNodes above for why this has
                  to be a child of the slide rather than the slide itself. */}
              <div data-embla-tween className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  // Only the first one. It is the LCP candidate; preloading
                  // the rest would put three or four full-width photos ahead
                  // of the fonts and the page's own JS in the queue, to show
                  // one.
                  priority={index === 0}
                  className="object-cover"
                  sizes={SIZES}
                />
                {(slide.title || slide.description) && (
                  // No background of its own -- it sits inside the panel's
                  // existing bottom scrim (hero-showcase.tsx), which already
                  // darkens exactly this area for the corner brackets.
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pt-10 pb-6 sm:px-6">
                    {slide.title && (
                      <p className="text-pishnam-off-white text-sm font-bold sm:text-base">
                        {slide.title}
                      </p>
                    )}
                    {slide.description && (
                      <p className="text-pishnam-off-white/80 mt-1 text-xs sm:text-sm">
                        {slide.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots carry the position visually, so this is for screen readers only
          -- a second visible counter would just say the same thing twice. */}
      <p aria-live="polite" className="sr-only">
        {t("status", { current: selectedIndex + 1, total: slides.length })}
      </p>

      {hasMultipleSlides && (
        // `pointer-events-none` on the layer, `auto` on each control: without
        // it this overlay would swallow every drag aimed at the track
        // beneath. `z-10` clears the panel's scrim, which hero-showcase.tsx
        // paints over the whole frame afterwards -- 70% navy across the gold
        // dots would cost them the contrast they were picked for.
        <div data-carousel-controls className="pointer-events-none absolute inset-0 z-10">
          <StepButton
            label={t("previous")}
            icon={ChevronLeft}
            onClick={scrollPrev}
            onKeyDown={handleKeyDown}
            className="start-3"
          />
          <StepButton
            label={t("next")}
            icon={ChevronRight}
            onClick={scrollNext}
            onKeyDown={handleKeyDown}
            className="end-3"
          />

          {/* A full-width centering strip rather than `start-1/2` plus a
              translate: `translate-x` is physical and would need its own RTL
              sign flip, while `justify-center` is direction-agnostic. */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3">
            <div className="relative flex items-center gap-2">
              {/* Backing plate -- see the equivalent note on StepButton for
                  why this needs its own explicit fill and can't just borrow
                  contrast from whatever photo happens to sit behind it. */}
              <span
                aria-hidden="true"
                className="bg-pishnam-navy-900/80 pointer-events-none absolute -inset-x-2.5 top-1/2 h-5 -translate-y-1/2 rounded-full backdrop-blur-sm"
              />
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  onKeyDown={handleKeyDown}
                  aria-label={t("goTo", { index: index + 1 })}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  // 24x44 around an 8px dot: WCAG 2.5.8 wants 24px on both
                  // axes, and the 8px gap means a thumb can land on one
                  // without catching two.
                  className="focus-visible:outline-pishnam-gold-500 pointer-events-auto relative flex h-11 w-6 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      // Scale, not width -- a transform composites, a width
                      // change relayouts the strip on every slide.
                      "size-2 rounded-full transition duration-200",
                      index === selectedIndex
                        ? "bg-pishnam-gold-500 motion-safe:scale-125"
                        : "bg-pishnam-off-white/55",
                    )}
                  />
                </button>
              ))}
            </div>

            {/* No reduced-motion visitor sees this: autoplay never starts
                for them, so a toggle for a feature that's already off would
                just be clutter. */}
            {/* {!reduceMotion && (
              <button
                type="button"
                onClick={() => setIsPlaying((playing) => !playing)}
                aria-label={isPlaying ? t("pause") : t("play")}
                aria-pressed={isPlaying}
                className="focus-visible:outline-pishnam-gold-500 bg-pishnam-navy-900/80 text-pishnam-off-white hover:bg-pishnam-navy-900/90 pointer-events-auto flex size-8 cursor-pointer items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm transition duration-200 ring-inset hover:ring-white/40 focus-visible:outline-2"
              >
                {isPlaying ? (
                  <Pause className="size-3.5" aria-hidden="true" />
                ) : (
                  <Play className="size-3.5" aria-hidden="true" />
                )}
              </button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Prev/next. One component for both, so the pair can't drift apart in size,
 * contrast, or focus treatment. No boundary state any more -- looping means
 * both directions are always available.
 */
function StepButton({
  label,
  icon: Icon,
  onClick,
  onKeyDown,
  className,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={label}
      className={cn(
        "pointer-events-auto absolute top-1/2 -translate-y-1/2",
        // 44px, and a dark chip so off-white stays past 4.5:1 even where the
        // photo behind it is blown out.
        "text-pishnam-off-white bg-pishnam-navy-900/80 flex size-11 items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm ring-inset",
        "hover:bg-pishnam-navy-900/90 cursor-pointer transition duration-200 hover:ring-white/40",
        "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      {/* Mirrored for Persian, where the track runs the other way -- same
          `rtl:-scale-x-100` the hero's CTA arrow uses. */}
      <Icon className="size-5 rtl:-scale-x-100" aria-hidden="true" />
    </button>
  );
}
