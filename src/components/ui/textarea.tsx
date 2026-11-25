import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      // `block` + `min-w-0`: avoid `display:flex` (breaks RTL placeholder
      // layout in some engines) and flex-item min-content blowouts that
      // widen the page past the viewport. Do not use overflow-x-clip —
      // it chops the start of RTL placeholder glyphs at non-100% zoom.
      "border-border bg-bg-surface text-text-primary block w-full min-w-0 rounded-md border px-3 py-2 text-start text-sm",
      "placeholder:text-text-secondary",
      "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-pishnam-danger aria-invalid:ring-pishnam-danger/40",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
