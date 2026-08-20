import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "border-border bg-bg-surface text-text-primary flex h-10 w-full appearance-none rounded-md border px-3 pe-9 text-sm",
        "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="text-text-secondary pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2"
      aria-hidden="true"
    />
  </div>
));
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
