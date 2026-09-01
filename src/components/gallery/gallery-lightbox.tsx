"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { GalleryVideoPlayer } from "./gallery-video-player";

export interface GalleryLightboxItem {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  image: string | null;
  video: string | null;
  alt: string;
  caption: string | null;
}

interface GalleryLightboxProps {
  items: GalleryLightboxItem[];
  openIndex: number | null;
  onOpenChange: (index: number | null) => void;
}

export function GalleryLightbox({ items, openIndex, onOpenChange }: GalleryLightboxProps) {
  const t = useTranslations("gallery.lightbox");
  const isRtl = useIsRtl();
  const open = openIndex !== null;
  const currentIndex = openIndex ?? 0;
  const current = items[currentIndex];
  const hasMultiple = items.length > 1;

  const goPrev = useCallback(() => {
    if (openIndex === null) return;
    onOpenChange(openIndex === 0 ? items.length - 1 : openIndex - 1);
  }, [openIndex, items.length, onOpenChange]);

  const goNext = useCallback(() => {
    if (openIndex === null) return;
    onOpenChange(openIndex === items.length - 1 ? 0 : openIndex + 1);
  }, [openIndex, items.length, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
      const backKey = isRtl ? "ArrowRight" : "ArrowLeft";

      if (event.key === forwardKey) {
        event.preventDefault();
        goNext();
      } else if (event.key === backKey) {
        event.preventDefault();
        goPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isRtl, goNext, goPrev]);

  if (!current) return null;

  const isVideo = current.mediaType === "VIDEO" && current.video;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(null)}>
      <DialogContent
        hideClose
        className="border-none bg-transparent p-0 shadow-none data-[state=closed]:[--tw-exit-scale:1] data-[state=open]:[--tw-enter-scale:1] sm:max-w-5xl"
        aria-describedby={current.caption ? "gallery-lightbox-caption" : undefined}
      >
        <DialogTitle className="sr-only">{current.alt}</DialogTitle>
        {current.caption ? (
          <DialogDescription id="gallery-lightbox-caption" className="sr-only">
            {current.caption}
          </DialogDescription>
        ) : null}

        <div className="relative flex flex-col gap-3">
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-xl bg-black/40",
              isVideo ? "aspect-video sm:aspect-video" : "aspect-[4/3] sm:aspect-[16/10]",
            )}
          >
            {isVideo ? (
              <GalleryVideoPlayer
                key={current.id}
                src={current.video!}
                poster={current.image}
                title={current.alt}
                active={open}
              />
            ) : current.image ? (
              <Image
                src={current.image}
                alt={current.alt}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 80vw, 100vw"
                priority
              />
            ) : null}

            <button
              type="button"
              onClick={() => onOpenChange(null)}
              aria-label={t("close")}
              className="text-pishnam-off-white bg-pishnam-navy-900/80 hover:bg-pishnam-navy-900/90 focus-visible:outline-pishnam-gold-500 absolute end-3 top-3 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm transition duration-200 hover:ring-white/40 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            {hasMultiple && (
              <>
                <NavButton
                  label={t("previous")}
                  icon={ChevronLeft}
                  onClick={goPrev}
                  className="start-3"
                />
                <NavButton
                  label={t("next")}
                  icon={ChevronRight}
                  onClick={goNext}
                  className="end-3"
                />
              </>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 px-1">
            {current.caption ? (
              <p className="text-pishnam-off-white text-sm leading-relaxed sm:text-base">
                {current.caption}
              </p>
            ) : (
              <span />
            )}
            {hasMultiple && (
              <p className="text-pishnam-off-white/70 shrink-0 text-sm tabular-nums">
                {t("status", { current: currentIndex + 1, total: items.length })}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NavButton({
  label,
  icon: Icon,
  onClick,
  className,
}: {
  label: string;
  icon: typeof ChevronLeft;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2",
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
