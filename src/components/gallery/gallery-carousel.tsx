"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { cn } from "@/lib/utils";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { GalleryLightbox, type GalleryLightboxItem } from "./gallery-lightbox";

const SIZES = "(min-width: 1024px) 33vw, 85vw";
const AUTOPLAY_DELAY_MS = 4000;

export function GalleryCarousel({ items }: { items: GalleryLightboxItem[] }) {
  const t = useTranslations("home.gallery.carousel");
  const tGallery = useTranslations("gallery");
  const isRtl = useIsRtl();
  const reduceMotion = useReducedMotionSafe();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const options: EmblaOptionsType = {
    loop: items.length > 1,
    align: "center",
    direction: isRtl ? "rtl" : "ltr",
    duration: reduceMotion ? 1 : 26,
    slidesToScroll: 1,
  };

  const [viewportRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const hasMultipleSlides = items.length > 1;

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || reduceMotion || !hasMultipleSlides || isInteracting) return;
    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_DELAY_MS);
    return () => clearInterval(id);
  }, [emblaApi, reduceMotion, hasMultipleSlides, isInteracting, restartKey]);

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

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
    const backKey = isRtl ? "ArrowRight" : "ArrowLeft";

    if (event.key === forwardKey) {
      event.preventDefault();
      scrollNext();
    } else if (event.key === backKey) {
      event.preventDefault();
      scrollPrev();
    }
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
      >
        <div
          ref={viewportRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={t("label")}
          className="overflow-hidden rounded-2xl"
        >
          <div className="flex">
            {items.map((item, index) => (
              <div
                key={item.id}
                role="group"
                aria-roledescription={t("slide")}
                aria-label={t("status", { current: index + 1, total: items.length })}
                className="relative min-w-0 shrink-0 grow-0 basis-[85%] ps-3 sm:basis-[70%] lg:basis-[45%] ltr:ps-0 ltr:pe-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (emblaApi?.clickAllowed()) setOpenIndex(index);
                  }}
                  aria-label={`${tGallery("openPhoto")}: ${item.alt}`}
                  className="border-pishnam-gold-500/30 bg-bg-surface-alt focus-visible:outline-pishnam-gold-500 relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl border shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    className="pointer-events-none object-contain"
                    sizes={SIZES}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 ring-1 ring-black/5 ring-inset"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {t("status", { current: selectedIndex + 1, total: items.length })}
        </p>

        {hasMultipleSlides && (
          <div className="pointer-events-none absolute inset-x-0 inset-y-0 flex items-center justify-between px-1 sm:px-2">
            <StepButton
              label={t("previous")}
              icon={ChevronLeft}
              onClick={scrollPrev}
              onKeyDown={handleKeyDown}
              className="start-0"
            />
            <StepButton
              label={t("next")}
              icon={ChevronRight}
              onClick={scrollNext}
              onKeyDown={handleKeyDown}
              className="end-0"
            />
          </div>
        )}

        {hasMultipleSlides && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={t("goTo", { index: index + 1 })}
                aria-current={index === selectedIndex ? "true" : undefined}
                className="focus-visible:outline-pishnam-gold-500 flex h-11 w-6 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 rounded-full transition duration-200",
                    index === selectedIndex
                      ? "bg-pishnam-gold-500 motion-safe:scale-125"
                      : "bg-border hover:bg-pishnam-gold-500/50",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <GalleryLightbox items={items} openIndex={openIndex} onOpenChange={setOpenIndex} />
    </>
  );
}

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
        "text-pishnam-off-white bg-pishnam-navy-900/80 flex size-10 items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm ring-inset sm:size-11",
        "hover:bg-pishnam-navy-900/90 cursor-pointer transition duration-200 hover:ring-white/40",
        "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <Icon className="size-5 rtl:-scale-x-100" aria-hidden="true" />
    </button>
  );
}
