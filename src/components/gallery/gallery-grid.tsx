"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { GalleryLightbox, type GalleryLightboxItem } from "./gallery-lightbox";

interface GalleryGridProps {
  items: GalleryLightboxItem[];
  openLabel: string;
}

export function GalleryGrid({ items, openLabel }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`${openLabel}: ${item.alt}`}
            className="group focus-visible:outline-pishnam-gold-500 relative cursor-pointer overflow-hidden rounded-xl text-start focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <div className="bg-bg-surface-alt relative aspect-[4/3] overflow-hidden">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <div
                aria-hidden="true"
                className={cn(
                  "bg-pishnam-navy-900/0 absolute inset-0 transition duration-300",
                  "group-hover:bg-pishnam-navy-900/20 group-focus-visible:bg-pishnam-navy-900/20",
                )}
              />
              {item.caption && (
                <div
                  aria-hidden="true"
                  className="from-pishnam-navy-900/90 absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t to-transparent px-4 pt-8 pb-3 transition duration-300 motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0"
                >
                  <p className="text-pishnam-off-white line-clamp-2 text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <GalleryLightbox items={items} openIndex={openIndex} onOpenChange={setOpenIndex} />
    </>
  );
}
