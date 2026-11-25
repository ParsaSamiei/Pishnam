import { cn } from "@/lib/utils";

// One hover gesture, shared by every card grid on the homepage: the card lifts,
// its border warms to gold, a gold glow pools underneath, a gold-to-steel rule
// wipes across the top edge, and the icon tile or cover image leans toward it.
// Kept in one place rather than repeated per section so the five grids --
// audience, downloads, news, achievements, videos -- read as one component
// family; the same reason lib/motion.ts owns the reveal timings.
//
// Deliberately CSS rather than Motion: none of it touches the card root's
// `transform`, which TiltCard owns, so a `whileHover` lift and these can run
// together without one clobbering the other's inline style. The two transforms
// sit behind `motion-safe:`, mirroring in CSS what the Motion components do in
// JS with `useReducedMotionSafe()`.
//
// The lift itself is the one part that is NOT here -- every card wraps in
// `TiltCard` for it, so the hover transform composes with the reveal instead of
// fighting it. Tilt is reserved for the grids that sit three across at full
// size (audience, news); denser grids and the video frame pass `tilt={false}`
// and take the lift alone.

/**
 * Card root: warms the border and pools a gold glow beneath it on hover.
 *
 * Carries `group` itself, so the rule and the icon tile work whether or not the
 * card sits inside a link that already declares one -- and `relative
 * overflow-hidden` so the rule can sit on the top edge and be clipped by the
 * card's own radius.
 *
 * No lift here: cards wrapped in `TiltCard` get theirs from Motion, and a CSS
 * `-translate-y` on the same element would fight it.
 */
export const cardHoverClass =
  "group relative overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-pishnam-gold-500/45 hover:shadow-[0_16px_40px_-24px_var(--card-hover-glow)]";

/** Icon tile inside a `cardHoverClass` card: tips and grows toward the rule. */
export const cardHoverIconClass =
  "transition-transform duration-300 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110";

/**
 * The rule that wipes across a card's top edge on hover. Absolutely positioned
 * so it never shifts the card's content, and `z-10` so it stays above a cover
 * image that comes later in flow (the news and achievement cards).
 *
 * The gradient runs gold-first from the inline start edge, so it mirrors with
 * the locale instead of always pointing the same physical way.
 */
export function CardHoverRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "from-pishnam-gold-500 to-steel-accent absolute inset-x-0 top-0 z-10 h-1 scale-x-0 bg-linear-to-r transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none rtl:bg-linear-to-l",
        className,
      )}
    />
  );
}
