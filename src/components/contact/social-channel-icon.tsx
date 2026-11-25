import type { SocialChannelId } from "@/lib/social-channels";
import { cn } from "@/lib/utils";

const CHANNEL_ICON: Record<SocialChannelId, string> = {
  youtube: "/brand/youtube.svg",
  instagram: "/brand/instagram.png",
  telegram: "/brand/telegram.svg",
  bale: "/brand/bale.png",
  aparat: "/brand/aparat.svg",
};

interface SocialChannelIconProps {
  id: SocialChannelId;
  className?: string;
}

/** Colored brand marks for Pishnam social channels. */
export function SocialChannelIcon({ id, className }: SocialChannelIconProps) {
  return (
    // Decorative — link text / aria-label carries the channel name.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CHANNEL_ICON[id]}
      alt=""
      width={16}
      height={16}
      className={cn("size-4 shrink-0 object-contain", className)}
      aria-hidden="true"
      decoding="async"
    />
  );
}
