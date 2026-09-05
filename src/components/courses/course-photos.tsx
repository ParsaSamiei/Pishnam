"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { GalleryLightbox, type GalleryLightboxItem } from "@/components/gallery/gallery-lightbox";

export type CoursePhotoView = {
  id: string;
  image: string;
  caption: string | null;
  alt: string;
};

interface CoursePhotosProps {
  photos: CoursePhotoView[];
  title: string;
}

export function CoursePhotos({ photos, title }: CoursePhotosProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const lightboxItems: GalleryLightboxItem[] = photos.map((photo) => ({
    id: photo.id,
    mediaType: "IMAGE",
    image: photo.image,
    video: null,
    alt: photo.alt,
    caption: photo.caption,
  }));

  return (
    <section className="mt-10" aria-labelledby="course-photos-heading">
      <Reveal from="start">
        <h2 id="course-photos-heading" className="text-text-primary text-lg font-bold">
          {title}
        </h2>
      </Reveal>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <Reveal key={photo.id} delay={0.04 * index} as="li">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="border-border bg-bg-surface-alt focus-visible:ring-pishnam-gold-500 group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl border transition-shadow duration-200 ease-out hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
              aria-label={photo.caption ?? photo.alt}
            >
              <Image
                src={photo.image}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 240px, 45vw"
              />
              {photo.caption ? (
                <span className="from-pishnam-navy-900/80 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-2.5 pt-8 pb-2 text-start text-xs font-medium text-white">
                  {photo.caption}
                </span>
              ) : null}
            </button>
          </Reveal>
        ))}
      </ul>

      <GalleryLightbox items={lightboxItems} openIndex={openIndex} onOpenChange={setOpenIndex} />
    </section>
  );
}
