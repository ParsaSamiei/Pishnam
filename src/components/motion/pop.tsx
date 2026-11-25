"use client";

import { motion } from "motion/react";
import { popVariants, staticVariants } from "@/lib/motion";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

interface PopProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Springs a small accent into place off its parent's variant state -- used for
 * the achievement year badge, which lands a beat after its card.
 *
 * Sets no trigger of its own, which is what keeps it in sync with the card
 * around it inside a `StaggerItem`. It also makes it safe outside one: with no
 * `initial` inherited from a Motion parent there is no variant to resolve, so
 * the element simply renders in its final state. That matters because
 * `AchievementCard` is reused on /about-us/achievements, /sponsors and course
 * pages, none of which animate -- the badge must never be left invisible
 * waiting for a trigger that will not come.
 */
export function Pop({ children, className }: PopProps) {
  const reduced = useReducedMotionSafe();

  return (
    <motion.span
      className={className}
      data-motion-reveal=""
      variants={reduced ? staticVariants : popVariants}
    >
      {children}
    </motion.span>
  );
}
