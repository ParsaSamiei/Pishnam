import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

// Animated text links for homepage section headers: label color warms to gold,
// a gold-to-steel rule grows under the label, and the trailing icon nudges in
// the reading direction. CSS-only (like card-hover.tsx) so it works inside
// server components and respects prefers-reduced-motion without hydration risk.

/** Root classes for the animated text link pattern. */
export const animatedLinkClass =
  "group inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-pishnam-steel-600 " +
  "transition-colors duration-300 hover:text-pishnam-gold-600 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pishnam-gold-500 focus-visible:ring-offset-2";

/** Trailing icon: nudges in the reading direction on hover. */
export const animatedLinkIconClass =
  "shrink-0 transition-transform duration-300 [&_svg]:size-4 " +
  "motion-safe:group-hover:translate-x-0.5 rtl:motion-safe:group-hover:-translate-x-0.5 motion-reduce:transition-none";

/** CTA row when nested inside a parent `group` link (e.g. audience cards). */
export const animatedLinkNestedClass =
  "inline-flex items-center gap-1.5 text-sm font-medium text-pishnam-steel-600 transition-colors duration-300 group-hover:text-pishnam-gold-600";

/**
 * Gold-to-steel rule that grows under the label on hover. Origin follows the
 * inline start edge so it mirrors with locale, same as `CardHoverRule`.
 */
export function AnimatedLinkUnderline({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "from-pishnam-gold-500 to-steel-accent origin-inline-start rtl:origin-inline-end absolute inset-x-0 -bottom-0.5 h-0.5 scale-x-0 bg-linear-to-r transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none rtl:bg-linear-to-l",
        className,
      )}
    />
  );
}

type AnimatedLinkContentProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** Label, underline, and icon — for use inside an existing `group` link. */
export function AnimatedLinkContent({ children, icon, className }: AnimatedLinkContentProps) {
  return (
    <span className={cn(animatedLinkNestedClass, className)}>
      <span className="relative">
        {children}
        <AnimatedLinkUnderline />
      </span>
      {icon != null && <span className={animatedLinkIconClass}>{icon}</span>}
    </span>
  );
}

type AnimatedLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  icon?: ReactNode;
};

export function AnimatedLink({ href, children, icon, className, ...props }: AnimatedLinkProps) {
  return (
    <Link href={href} className={cn(animatedLinkClass, className)} {...props}>
      <span className="relative">
        {children}
        <AnimatedLinkUnderline />
      </span>
      {icon != null && <span className={animatedLinkIconClass}>{icon}</span>}
    </Link>
  );
}
