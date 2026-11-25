"use client";

import type { KeyboardEventHandler } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselStepButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  className?: string;
  size?: "default" | "small";
};

/** The shared arrow control from the existing hero and gallery sliders. */
export function CarouselStepButton({
  label,
  icon: Icon,
  onClick,
  onKeyDown,
  className,
  size = "default",
}: CarouselStepButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={label}
      className={cn(
        "pointer-events-auto absolute top-1/2 -translate-y-1/2",
        "text-pishnam-off-white bg-pishnam-navy-900/80 flex items-center justify-center rounded-full ring-1 ring-white/20 backdrop-blur-sm ring-inset",
        size === "small" ? "size-9 sm:size-10" : "size-11",
        "hover:bg-pishnam-navy-900/90 cursor-pointer transition duration-200 hover:ring-white/40",
        "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <Icon className="size-5 rtl:-scale-x-100" aria-hidden="true" />
    </button>
  );
}
