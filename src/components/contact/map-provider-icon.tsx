import type { MapProvider } from "@/lib/map-navigation";
import { cn } from "@/lib/utils";

const PROVIDER_ICON: Record<MapProvider, { src: string; alt: string }> = {
  google: { src: "/brand/google-maps.svg", alt: "" },
  balad: { src: "/brand/balad.png", alt: "" },
  neshan: { src: "/brand/neshan.png", alt: "" },
};

type MapProviderIconProps = {
  provider: MapProvider;
  className?: string;
};

/** Colored brand marks for map / navigation apps. */
export function MapProviderIcon({ provider, className }: MapProviderIconProps) {
  const icon = PROVIDER_ICON[provider];
  return (
    // Decorative — the adjacent link text (or aria-label) carries the name.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon.src}
      alt={icon.alt}
      width={16}
      height={16}
      className={cn("size-4 shrink-0 object-contain", className)}
      aria-hidden="true"
      decoding="async"
    />
  );
}
