import type { GalleryLightboxItem } from "@/components/gallery/gallery-lightbox";

export function toGalleryLightboxItem(
  row: {
    id: string;
    mediaType: "IMAGE" | "VIDEO";
    image: string | null;
    video: string | null;
    altFa: string | null;
    altEn: string | null;
    captionFa: string | null;
    captionEn: string | null;
  },
  locale: { alt: string; caption: string | null },
): GalleryLightboxItem {
  return {
    id: row.id,
    mediaType: row.mediaType,
    image: row.image,
    video: row.video,
    alt: locale.alt,
    caption: locale.caption,
  };
}
