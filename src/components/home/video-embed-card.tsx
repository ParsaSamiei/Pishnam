"use client";

import { useState } from "react";
import { AppVideoPlayer } from "@/components/media/app-video-player";
import Image from "next/image";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface VideoEmbedCardProps {
  title: string;
  thumbnail: string | null;
  aparatUrl?: string | null;
  hostedVideo?: string | null;
  topicTags?: string[];
  /** When false, only the player is shown (e.g. on a course detail page). */
  showTitle?: boolean;
}

/**
 * Renders a static thumbnail + play button until clicked -- Aparat iframes and
 * hosted `<video>` elements only mount on interaction, per the perf target in
 * docs/05-frontend-architecture.md.
 */
export function VideoEmbedCard({
  title,
  thumbnail,
  aparatUrl,
  hostedVideo,
  topicTags,
  showTitle = true,
}: VideoEmbedCardProps) {
  const [playing, setPlaying] = useState(false);
  const isHosted = Boolean(hostedVideo);

  function handlePlay() {
    setPlaying(true);
    track("video_play", {
      title,
      topic: topicTags?.join(","),
      source: isHosted ? "hosted" : "aparat",
    });
  }

  const card = (
    <Card className={cn("overflow-hidden p-0", cardHoverClass)}>
      <CardHoverRule />
      <div className="bg-pishnam-navy-900 relative aspect-video w-full overflow-hidden">
        {playing ? (
          isHosted ? (
            <AppVideoPlayer
              src={hostedVideo!}
              poster={thumbnail}
              title={title}
              autoPlay
              className="absolute inset-0 h-full w-full"
              videoClassName="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <iframe
              src={aparatUrl!}
              title={title}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          )
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className={cn(
              "absolute inset-0 flex h-full w-full items-center justify-center",
              "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:outline-none",
            )}
            aria-label={title}
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt=""
                fill
                className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 380px, 100vw"
              />
            ) : isHosted ? (
              <div
                aria-hidden="true"
                className="from-pishnam-navy-900 via-pishnam-navy-800 to-pishnam-navy-900 absolute inset-0 bg-gradient-to-br"
              />
            ) : null}
            <span className="bg-pishnam-gold-500 text-pishnam-navy-900 relative flex size-14 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="size-6 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      {showTitle && (
        <CardContent className="p-4">
          <h3 className="text-text-primary line-clamp-2 font-bold">{title}</h3>
        </CardContent>
      )}
    </Card>
  );

  return playing ? card : <TiltCard tilt={false}>{card}</TiltCard>;
}
