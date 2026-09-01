"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { GalleryLightboxItem } from "./gallery-lightbox";

interface GalleryMediaThumbProps {
  item: GalleryLightboxItem;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function GalleryMediaThumb({
  item,
  sizes,
  priority,
  className,
  imageClassName,
}: GalleryMediaThumbProps) {
  const t = useTranslations("gallery");
  const isVideo = item.mediaType === "VIDEO";

  return (
    <div className={cn("bg-bg-surface-alt relative overflow-hidden", className)}>
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          fill
          priority={priority}
          className={cn("object-contain", imageClassName)}
          sizes={sizes}
        />
      ) : (
        <div
          aria-hidden="true"
          className="from-pishnam-navy-900 via-pishnam-navy-800 to-pishnam-navy-900 absolute inset-0 bg-gradient-to-br"
        />
      )}

      {isVideo && (
        <>
          <div
            aria-hidden="true"
            className="bg-pishnam-navy-900/25 pointer-events-none absolute inset-0"
          />
          <span
            aria-hidden="true"
            className="bg-pishnam-gold-500 text-pishnam-navy-900 absolute start-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
          >
            {t("videoBadge")}
          </span>
          <span
            aria-hidden="true"
            className="bg-pishnam-gold-500 text-pishnam-navy-900 absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110 sm:size-14"
          >
            <Play className="size-5 fill-current sm:size-6" />
          </span>
        </>
      )}
    </div>
  );
}
