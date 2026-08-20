import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-border bg-bg-surface text-text-primary flex w-full rounded-md border px-3 py-2 text-sm",
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
