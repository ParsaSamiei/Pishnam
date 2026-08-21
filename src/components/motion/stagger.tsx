"use client";

import { motion } from "motion/react";
import {
  cardVariants,
  groupVariants,
  headingVariants,
  riseVariants,
  staticVariants,
  STAGGER,
  VIEWPORT,
} from "@/lib/motion";
import { useIsRtl } from "./use-is-rtl";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

const GROUP_TAGS = { div: motion.div, ul: motion.ul } as const;
const ITEM_TAGS = { div: motion.div, li: motion.li } as const;

interface StaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between siblings. */
  stagger?: number;
  /** Seconds before the first child starts -- lets a grid follow its heading. */
  delayChildren?: number;
  /** `mount` fires immediately -- only correct above the fold (the hero). */
  trigger?: "inView" | "mount";
  as?: keyof typeof GROUP_TAGS;
}

/**
 * Schedules its children into a cascade. Has no visual effect of its own: the
 * `hidden`/`visible` names propagate down through Motion's context, so any
 * `StaggerItem` inside -- even one rendered by a server component in between --
 * animates off this parent rather than its own viewport trigger.
 */
export function StaggerGroup({
  children,
  className,
  stagger = STAGGER,
  delayChildren = 0,
  trigger = "inView",
  as = "div",
}: StaggerGroupProps) {
  const reduced = useReducedMotionSafe();
  const Tag = GROUP_TAGS[as];

  return (
    <Tag
      className={className}
      variants={reduced ? staticVariants : groupVariants(stagger, delayChildren)}
      initial="hidden"
      {...(trigger === "mount"
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: VIEWPORT })}
    >
      {children}
    </Tag>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  /**
   * `card` scales up as it rises (grid tiles); `rise` travels only (text);
   * `heading` slides in from the inline start edge with a blur-in.
   */
  variant?: "card" | "rise" | "heading";
  as?: keyof typeof ITEM_TAGS;
}

/**
 * One member of a `StaggerGroup`. Deliberately declares no `initial`/`animate`:
 * that absence is what makes it inherit the parent's state instead of running
 * its own timeline.
 */
export function StaggerItem({
  children,
  className,
  variant = "card",
  as = "div",
}: StaggerItemProps) {
  const reduced = useReducedMotionSafe();
  const rtl = useIsRtl();
  const Tag = ITEM_TAGS[as];

  const variants = reduced
    ? staticVariants
    : variant === "card"
      ? cardVariants
      : variant === "rise"
        ? riseVariants
        : headingVariants(rtl);

  return (
    <Tag className={className} data-motion-reveal="" variants={variants}>
      {children}
    </Tag>
  );
}
