import { Instagram, Youtube } from "lucide-react";
import type { SocialChannelId } from "@/lib/social-channels";
import { cn } from "@/lib/utils";

interface SocialChannelIconProps {
  id: SocialChannelId;
  className?: string;
}

/** Brand-shaped marks for channels lucide does not cover (Telegram, Bale, Aparat). */
export function SocialChannelIcon({ id, className }: SocialChannelIconProps) {
  switch (id) {
    case "youtube":
      return <Youtube className={className} aria-hidden="true" />;
    case "instagram":
      return <Instagram className={className} aria-hidden="true" />;
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M21.8 4.4c.3-.9-.5-1.6-1.3-1.3L2.9 9.6c-.9.3-.9 1.6.1 1.8l4.6 1.1 1.7 5.4c.3.9 1.5 1 2 .3l2.5-2.8 4.7 3.5c.8.6 1.9.1 2.1-.9l2.2-13.6ZM9.4 17.1l-1.1-3.6 8.3-7.5-7.2 8.6v2.5Zm8.8 1.1-4.4-3.3 5.9-7.1-1.5 10.4Z" />
        </svg>
      );
    case "bale":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2.2c-5.4 0-9.8 4.4-9.8 9.8 0 1.7.4 3.3 1.2 4.7L2 21.8l5.3-1.4c1.3.7 2.9 1.1 4.5 1.1 5.4 0 9.8-4.4 9.8-9.8S17.4 2.2 12 2.2Zm4.4 12.4c-.2.5-1 .9-1.4 1-.4.1-.9.2-1.4 0-.4-.1-.8-.2-1.3-.4-2.2-1-3.6-3-4-3.5-.4-.5-1.2-1.6-1.2-3 0-1.4.7-2.1 1-2.3.3-.2.6-.3 1-.3h.3c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5-.1.1-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.9 1.7 1.2 1.9 1.3.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.7 1.8.9.3.1.4.2.5.3.1.2.1.9-.1 1.4Z" />
        </svg>
      );
    case "aparat":
      // Icons8 monochrome film-reel mark, tinted via currentColor (same as sibling icons).
      return (
        <span
          className={cn("inline-block bg-current", className)}
          style={{
            maskImage: "url(/brand/aparat.png)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskImage: "url(/brand/aparat.png)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
          aria-hidden="true"
        />
      );
  }
}
