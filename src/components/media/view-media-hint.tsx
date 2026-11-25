import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewMediaHintProps {
  label: string;
  className?: string;
}

/** Hover/focus badge for lightboxable media — matches achievements & licenses. */
export function ViewMediaHint({ label, className }: ViewMediaHintProps) {
  return (
    <span
      className={cn(
        "bg-pishnam-navy-900/80 text-pishnam-off-white absolute end-2.5 bottom-2.5 z-[2] inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] font-medium",
        "opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-100",
        className,
      )}
      aria-hidden="true"
    >
      <Expand className="size-3" />
      {label}
    </span>
  );
}
