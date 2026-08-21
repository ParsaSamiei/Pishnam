"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface VideoEmbedCardProps {
  title: string;
  aparatUrl: string;
  thumbnail: string | null;
  topicTags?: string[];
}

/**
 * Renders a static thumbnail + play button until clicked -- the iframe embed
 * (and Aparat's player script) only mounts on interaction, per the perf
 * target in docs/05-frontend-architecture.md ("lazy-loaded... don't load
 * iframe until in viewport / user interaction").
 */
export function VideoEmbedCard({ title, aparatUrl, thumbnail, topicTags }: VideoEmbedCardProps) {
  const [playing, setPlaying] = useState(false);

  function handlePlay() {
    setPlaying(true);
    track("video_play", { title, topic: topicTags?.join(",") });
  }

  const card = (
    <Card className={cn("overflow-hidden p-0", cardHoverClass)}>
      <CardHoverRule />
      {/* `overflow-hidden` so the thumbnail's hover zoom crops inside the frame
          instead of bleeding a sliver over the title below. */}
      <div className="bg-pishnam-navy-900 relative aspect-video w-full overflow-hidden">
        {playing ? (
          <iframe
            src={aparatUrl}
            title={title}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          // No `group` of its own: the Card owns it via `cardHoverClass`, so the
          // thumbnail and badge react to the whole card the way the news card's
          // cover reacts to its link -- including a hover that starts on the title.
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
            ) : null}
            {/* Grows but does not tip: `cardHoverIconClass` on a round badge
                leaves the play glyph looking crooked rather than tilted. */}
            <span className="bg-pishnam-gold-500 text-pishnam-navy-900 relative flex size-14 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="size-6 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-text-primary line-clamp-2 font-bold">{title}</h3>
      </CardContent>
    </Card>
  );

  // Before play, the card is a thumbnail like any other and lifts like one.
  // After, the lift is dropped: nudging a mounted player when the pointer
  // crosses it turns its controls into a moving target. `tilt` stays off
  // either way -- rotating a 16/9 video frame reads as skew, not depth.
  return playing ? card : <TiltCard tilt={false}>{card}</TiltCard>;
}
