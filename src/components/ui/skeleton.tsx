import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shiny placeholder block for loading states. Uses a diagonal gold sheen
 * (see `.skeleton-shine` in globals.css) so it matches the brand logo shine
 * rather than a flat pulse.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-shine bg-bg-surface-alt relative overflow-hidden rounded-md",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
