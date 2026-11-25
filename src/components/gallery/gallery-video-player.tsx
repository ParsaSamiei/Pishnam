"use client";

import { useTranslations } from "next-intl";
import { AppVideoPlayer } from "@/components/media/app-video-player";

interface GalleryVideoPlayerProps {
  src: string;
  poster?: string | null;
  title: string;
  active: boolean;
}

export function GalleryVideoPlayer({ src, poster, title, active }: GalleryVideoPlayerProps) {
  const t = useTranslations("gallery");

  return (
    <AppVideoPlayer
      src={src}
      poster={poster}
      title={title}
      active={active}
      overlayPlay
      overlayPlayLabel={t("playVideo")}
      className="h-full w-full"
      videoClassName="h-full w-full object-contain"
    />
  );
}
