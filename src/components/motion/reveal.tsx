"use client";

import { motion } from "motion/react";
import { headingVariants, riseVariants, staticVariants, withDelay, VIEWPORT } from "@/lib/motion";
import { useIsRtl } from "./use-is-rtl";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

const TAGS = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  li: motion.li,
} as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /**
   * `start` slides in from the inline start edge with a blur-in (headings);
   * `bottom` just rises (body copy, links).
   */
  from?: "start" | "bottom";
  /** Seconds to offset this element behind its siblings. */
  delay?: number;
  /** `mount` fires immediately -- only correct above the fold (the hero). */
  trigger?: "inView" | "mount";
  as?: keyof typeof TAGS;
}

/**
 * Reveals one element as it scrolls into view. Wraps server-rendered children,
 * so sections stay server components and only this wrapper ships to the client
 * (docs/05-frontend-architecture.md).
 *
 * `data-motion-reveal` is the escape hatch for visitors without JS: the
 * initial variant is server-rendered as `opacity: 0`, and a
 * `@media (scripting: none)` rule in globals.css resets it so the text is
 * never invisible to a non-rendering crawler.
 */
export function Reveal({
  children,
  className,
  from = "bottom",
  delay = 0,
  trigger = "inView",
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotionSafe();
  const rtl = useIsRtl();
  const Tag = TAGS[as];

  const base = reduced ? staticVariants : from === "start" ? headingVariants(rtl) : riseVariants;
  const variants = delay > 0 && !reduced ? withDelay(base, delay) : base;

  return (
    <Tag
      className={className}
      data-motion-reveal=""
      variants={variants}
      initial="hidden"
      {...(trigger === "mount"
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: VIEWPORT })}
    >
      {children}
    </Tag>
  );
}
