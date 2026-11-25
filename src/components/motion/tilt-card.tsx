"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { SPRING_TRACK } from "@/lib/motion";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

/** Maximum tilt in degrees. Past ~6deg the card's text starts to read skewed. */
const MAX_TILT = 5;

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Set false for a lift with no tilt. Small tiles sitting five-across read as
   * noise when they all tip independently.
   */
  tilt?: boolean;
}

/**
 * Tilts its contents toward the pointer, with a small lift. Used on the three
 * homepage audience cards -- the page's primary interactive block -- so hover
 * and reveal come from one motion system rather than CSS transitions layered
 * under Motion transforms.
 *
 * Inert for touch and pen input (checked per event via `pointerType`, so there
 * is no hydration-sensitive media query) and under `prefers-reduced-motion`,
 * where it keeps rendering the same motion element and simply drops the
 * transform -- swapping to a plain `div` instead would remount the card's
 * whole subtree one commit after hydration.
 */
export function TiltCard({ children, className, tilt = true }: TiltCardProps) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer position within the card, normalised to -0.5..0.5 on each axis.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, SPRING_TRACK);
  const smoothY = useSpring(pointerY, SPRING_TRACK);

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  // Inverted: pointer below centre should tip the card's top edge away.
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  const active = tilt && !reduced;

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={active ? handlePointerMove : undefined}
      onPointerLeave={active ? handlePointerLeave : undefined}
      style={active ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={SPRING_TRACK}
    >
      {children}
    </motion.div>
  );
}
