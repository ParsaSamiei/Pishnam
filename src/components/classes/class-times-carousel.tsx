"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { CarouselStepButton } from "@/components/ui/carousel-step-button";
import { ClassSessionDetails, type ClassSessionTime } from "./class-session-grid";
import type { AppLocale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

type ClassTimesCarouselProps = {
  sessions: ClassSessionTime[];
  courseTitle: string;
  locale: AppLocale;
};

/** An independent, manual Embla slider for one course's available class times. */
export function ClassTimesCarousel({ sessions, courseTitle, locale }: ClassTimesCarouselProps) {
  const t = useTranslations("enrollmentSchedule.carousel");
  const isRtl = useIsRtl();
  const reduceMotion = useReducedMotionSafe();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    loop: sessions.length > 1,
    align: "start",
    direction: isRtl ? "rtl" : "ltr",
    duration: reduceMotion ? 1 : 26,
  });

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goToSlide = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!emblaApi) return;
    if (event.key === (isRtl ? "ArrowLeft" : "ArrowRight")) {
      event.preventDefault();
      scrollNext();
    } else if (event.key === (isRtl ? "ArrowRight" : "ArrowLeft")) {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "Home") {
      event.preventDefault();
      goToSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goToSlide(sessions.length - 1);
    }
  }

  if (sessions.length === 0) return null;
  if (sessions.length === 1) return <ClassSessionDetails session={sessions[0]!} locale={locale} />;

  return (
    <div>
      <div className="relative">
        <div
          ref={viewportRef}
          data-course-schedule-carousel
          role="group"
          aria-roledescription="carousel"
          aria-label={t("label", { course: courseTitle })}
          tabIndex={emblaApi ? -1 : 0}
          className="touch-pan-y overflow-hidden"
        >
          <div className="flex items-stretch">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                data-course-schedule-slide={index}
                role="group"
                aria-roledescription={t("slide")}
                aria-label={t("status", { current: index + 1, total: sessions.length })}
                aria-hidden={emblaApi ? index !== selectedIndex : undefined}
                className="min-w-0 shrink-0 grow-0 basis-full px-12"
              >
                <ClassSessionDetails session={session} locale={locale} />
              </div>
            ))}
          </div>
        </div>

        <div data-carousel-controls className="pointer-events-none absolute inset-0">
          <CarouselStepButton
            label={t("previous", { course: courseTitle })}
            icon={ChevronLeft}
            onClick={scrollPrev}
            onKeyDown={handleKeyDown}
            className="start-0"
          />
          <CarouselStepButton
            label={t("next", { course: courseTitle })}
            icon={ChevronRight}
            onClick={scrollNext}
            onKeyDown={handleKeyDown}
            className="end-0"
          />
        </div>
      </div>

      <div data-carousel-controls className="mt-3 flex items-center justify-center gap-2">
        {sessions.map((session, index) => (
          <button
            key={session.id}
            type="button"
            onClick={() => goToSlide(index)}
            onKeyDown={handleKeyDown}
            aria-label={t("goTo", { index: index + 1, course: courseTitle })}
            aria-current={index === selectedIndex ? "true" : undefined}
            className="focus-visible:outline-pishnam-gold-500 flex h-11 w-6 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full transition-transform duration-200 motion-reduce:transition-none",
                index === selectedIndex
                  ? "bg-pishnam-gold-500 ring-text-primary/70 scale-125 ring-1"
                  : "bg-text-secondary",
              )}
            />
          </button>
        ))}
      </div>
      {emblaApi ? (
        <p aria-live="polite" className="sr-only">
          {t("status", { current: selectedIndex + 1, total: sessions.length })}
        </p>
      ) : null}
    </div>
  );
}
