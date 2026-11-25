import type { SpringOptions, Transition, Variants } from "motion/react";

// Shared motion vocabulary for the site. Every animated component imports its
// timings and variants from here rather than hardcoding numbers, so the six
// homepage sections read as one continuous page instead of six separately
// tuned animations -- see docs/03-design-system.md ("fewer, more purposeful
// color blocks"); the same restraint applies to motion.
//
// Note on direction: Motion animates the physical `x` axis, but the site is
// RTL-first (docs/03-design-system.md). Anything that travels horizontally
// takes a `sign` from `directionSign()` so "from the inline start edge" means
// left in English and right in Persian.

/** Standard ease-out. Entering elements decelerate; nothing uses linear. */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

export const DURATION = {
  fast: 0.28,
  base: 0.55,
  slow: 0.8,
} as const;

/** Springs for elements that pop rather than glide (the year badge). */
export const SPRING: Transition = { type: "spring", stiffness: 320, damping: 24, mass: 0.7 };

/**
 * Config for `useSpring` smoothing of a continuously changing value -- pointer
 * position under a tilting card, scroll progress along the spine. Soft enough
 * that the value trails the input rather than snapping to it.
 */
export const SPRING_TRACK: SpringOptions = { stiffness: 140, damping: 24, mass: 0.5 };

/** Gap between siblings in a staggered grid. */
export const STAGGER = 0.09;

/**
 * Shared `whileInView` trigger. `once` matters: re-firing on every scroll-by
 * turns a page into a slot machine, and the UX guidance caps motion at one
 * reveal per viewport.
 */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

/** +1 when the inline start edge is on the left (LTR), -1 in RTL. */
export function directionSign(rtl: boolean) {
  return rtl ? -1 : 1;
}

/** Section headings: slide in from the inline start edge with a blur-in. */
export function headingVariants(rtl: boolean, distance = 60): Variants {
  return {
    hidden: { opacity: 0, x: -distance * directionSign(rtl), filter: "blur(6px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: DURATION.base, ease: EASE_OUT },
    },
  };
}

/** Body copy and links that accompany a heading -- rise only, no travel. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Grid cards: scale up from 0.94 as they rise. */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Small accents (the achievement year badge) landing a beat after their card. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...SPRING, delay: DURATION.fast },
  },
};

/**
 * Parent of a staggered group. Carries no visual change of its own -- it only
 * schedules its children, which inherit these variant names automatically.
 */
export function groupVariants(stagger = STAGGER, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/**
 * Offsets a variant set in time. Needed because a variant's own `transition`
 * wins over a component's `transition` prop, so `delay` has to be merged into
 * the variant itself rather than passed alongside it.
 */
export function withDelay(variants: Variants, delay: number): Variants {
  const visible = variants.visible;
  if (!visible || typeof visible === "function") return variants;

  return {
    ...variants,
    visible: { ...visible, transition: { ...visible.transition, delay } },
  };
}

/**
 * Reduced-motion counterpart to any of the above: same variant names, no
 * transform or blur, so `useReducedMotion()` can swap variants without the
 * calling component branching on it.
 */
export const staticVariants: Variants = {
  hidden: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
  visible: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
};
