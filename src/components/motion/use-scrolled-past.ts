"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/**
 * True once the page is scrolled past `threshold` pixels.
 *
 * Reads from the same Motion scroll source as `ScrollSpine`, so the header and
 * the page's own progress indicator can never disagree about how far down the
 * visitor is. Only a threshold crossing re-renders: setting the state to its
 * current value is a no-op in React, so the per-frame scroll events are free.
 */
export function useScrolledPast(threshold: number) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > threshold);
  });

  return scrolled;
}
