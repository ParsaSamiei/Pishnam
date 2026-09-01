"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import type { EmblaOptionsType } from "embla-carousel";
import { cn } from "@/lib/utils";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { GalleryLightbox, type GalleryLightboxItem } from "./gallery-lightbox";
import { GalleryMediaThumb } from "./gallery-media-thumb";

const SIZES = "(min-width: 1024px) 22vw, (min-width: 640px) 32vw, 55vw";
const DRAG_THRESHOLD_PX = 8;
/** Pixels advanced per animation frame — higher is faster. */
const SCROLL_SPEED = 2.2;

function useSlideClick(onOpen: (index: number) => void) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    dragged.current = false;
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = Math.abs(event.clientX - pointerStart.current.x);
    const dy = Math.abs(event.clientY - pointerStart.current.y);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
      dragged.current = true;
    }
  }, []);

  const onPointerUp = useCallback(() => {
    pointerStart.current = null;
  }, []);

  const onClick = useCallback(
    (index: number) => {
      if (!dragged.current) onOpen(index);
      dragged.current = false;
    },
    [onOpen],
  );

  return { onPointerDown, onPointerMove, onPointerUp, onClick };
}

export function GalleryCarousel({ items }: { items: GalleryLightboxItem[] }) {
  const t = useTranslations("home.gallery.carousel");
  const tGallery = useTranslations("gallery");
  const isRtl = useIsRtl();
  const reduceMotion = useReducedMotionSafe();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const slideClick = useSlideClick(setOpenIndex);

  const hasMultipleSlides = items.length > 1;
  const canAutoScroll = hasMultipleSlides && !reduceMotion;

  const plugins = useMemo(
    () =>
      canAutoScroll
        ? [
            AutoScroll({
              speed: SCROLL_SPEED,
              startDelay: 0,
              playOnInit: true,
              stopOnMouseEnter: true,
              stopOnFocusIn: true,
              // Resume after drag or arrow navigation instead of stopping permanently.
              stopOnInteraction: false,
            }),
          ]
        : [],
    [canAutoScroll],
  );

  const options: EmblaOptionsType = useMemo(
    () => ({
      loop: hasMultipleSlides,
      align: "start",
      dragFree: true,
      direction: isRtl ? "rtl" : "ltr",
    }),
    [hasMultipleSlides, isRtl],
  );

  const [viewportRef, emblaApi] = useEmblaCarousel(options, plugins);

  useEffect(() => {
    if (!emblaApi) return;
    const autoScroll = emblaApi.plugins()?.autoScroll;
    if (!autoScroll) return;

    if (canAutoScroll) {
      autoScroll.play();
    } else {
      autoScroll.stop();
    }
  }, [emblaApi, canAutoScroll]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    emblaApi?.plugins()?.autoScroll?.play();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    emblaApi?.plugins()?.autoScroll?.play();
  }, [emblaApi]);

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
      <div className="relative mx-auto max-w-5xl">
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
                className="relative flex min-w-0 shrink-0 grow-0 basis-[52%] justify-center ps-2 sm:basis-[38%] sm:ps-3 md:basis-[32%] lg:basis-[26%] ltr:ps-0 ltr:pe-2 sm:ltr:pe-3"
              >
                <button
                  type="button"
                  onPointerDown={slideClick.onPointerDown}
                  onPointerMove={slideClick.onPointerMove}
                  onPointerUp={slideClick.onPointerUp}
                  onPointerCancel={slideClick.onPointerUp}
                  onClick={() => slideClick.onClick(index)}
                  aria-label={`${tGallery("openItem")}: ${item.alt}`}
                  className="border-pishnam-gold-500/30 bg-bg-surface-alt focus-visible:outline-pishnam-gold-500 group relative aspect-[3/2] w-full max-w-[280px] cursor-pointer overflow-hidden rounded-lg border shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-none"
                >
                  <GalleryMediaThumb
                    item={item}
                    sizes={SIZES}
                    priority={index === 0}
                    className="absolute inset-0"
                    imageClassName="pointer-events-none"
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
        "text-pishnam-off-white bg-pishnam-navy-900/80 flex size-9 items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm ring-inset sm:size-10",
        "hover:bg-pishnam-navy-900/90 cursor-pointer transition duration-200 hover:ring-white/40",
        "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <Icon className="size-5 rtl:-scale-x-100" aria-hidden="true" />
    </button>
  );
}
