import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MediaMentionPanelProps {
  children: ReactNode;
  className?: string;
}

/** Stacked press citations — one surface, hairline dividers between rows. */
export function MediaMentionPanel({ children, className }: MediaMentionPanelProps) {
  return (
    <div
      className={cn(
        "border-border bg-bg-surface overflow-hidden rounded-2xl border shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
        className,
      )}
    >
      <div className="divide-border flex flex-col divide-y">{children}</div>
    </div>
  );
}
