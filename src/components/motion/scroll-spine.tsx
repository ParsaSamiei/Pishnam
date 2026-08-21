"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { SPRING_TRACK } from "@/lib/motion";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

/**
 * The device that joins the homepage together: a PCB trace running down the
 * inline-start gutter that draws itself as far as the visitor has read, with a
 * solder via landing on each section seam and a lit "signal" head riding the
 * leading edge.
 *
 * It extends the motif of `CircuitBackground` (components/layout/
 * circuit-background.tsx) from ambient wallpaper into page structure -- the
 * sections stop reading as six unrelated slabs because one trace visibly
 * connects them.
 *
 * Sections opt in by putting `data-spine-node` on their root element; their
 * measured offsets become the via positions, so a section that returns `null`
 * for want of data simply doesn't get a via.
 */
export function ScrollSpine({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionSafe();
  const containerRef = useRef<HTMLDivElement>(null);
  const [seams, setSeams] = useState<number[]>([]);
  const [height, setHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smoothed so the trace trails the scroll slightly instead of tracking it
  // rigidly, then clamped -- the spring overshoots past 1 at the page end,
  // which would leave the dash pattern briefly inverted.
  const smoothed = useSpring(scrollYProgress, SPRING_TRACK);
  const progress = useTransform(smoothed, (value) => Math.min(1, Math.max(0, value)));

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    if (!bounds.height) return;

    // getBoundingClientRect rather than offsetTop: independent of which
    // ancestor happens to be the offsetParent.
    const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-spine-node]"))
      .map((node) => (node.getBoundingClientRect().top - bounds.top) / bounds.height)
      // Drop the first and last seams -- a via pinned to the very top or
      // bottom of the page reads as a stray dot rather than a joint.
      .filter((fraction) => fraction > 0.02 && fraction < 0.98);

    setHeight(bounds.height);
    setSeams(nodes);
  }, []);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    // Images and the variable-font swap both change section heights after
    // first paint, which moves every seam below them.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div ref={containerRef} className="relative">
      {children}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-1 hidden w-4 sm:block lg:start-2"
      >
        {/* No `vector-effect: non-scaling-stroke` on these lines, deliberately.
            Motion drives `pathLength` through `stroke-dasharray` normalized by
            `pathLength="1"`, and non-scaling-stroke makes Chromium apply the
            dash lengths in screen space while still normalizing against the
            100-unit viewBox -- on a spine ~2000px tall that turns the progress
            fill into a repeating dash. Plain strokes keep their 1.5px weight
            anyway: the viewBox is 16 wide inside a `w-4` box, so the x scale
            (the one a vertical line's stroke width follows) is 1. */}
        <svg
          className="h-full w-full"
          viewBox="0 0 16 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Unlit board trace: present the whole way down, so the lit
              section reads as progress along a track rather than a line
              growing out of nothing. */}
          <line x1="8" y1="0" x2="8" y2="100" stroke="var(--color-border)" strokeWidth="1.5" />
          {/* Butt cap, not round: the y scale would stretch a round cap into a
              ~15px gold tail hanging off the leading edge. */}
          <motion.line
            x1="8"
            y1="0"
            x2="8"
            y2="100"
            stroke="var(--color-pishnam-gold-500)"
            strokeWidth="1.5"
            style={{ pathLength: reduced ? 1 : progress }}
          />
        </svg>

        {!reduced && height > 0 ? <SpineHead progress={progress} height={height} /> : null}

        {seams.map((at) => (
          <SpineVia key={at} progress={progress} at={at} reduced={Boolean(reduced)} />
        ))}
      </div>
    </div>
  );
}

/** A solder pad at one section seam, lighting up as the trace reaches it. */
function SpineVia({
  progress,
  at,
  reduced,
}: {
  progress: MotionValue<number>;
  at: number;
  reduced: boolean;
}) {
  const scale = useTransform(progress, [at - 0.03, at], [0.4, 1]);
  const opacity = useTransform(progress, [at - 0.03, at], [0, 1]);

  return (
    <div className="absolute inset-x-0 flex justify-center" style={{ top: `${at * 100}%` }}>
      <motion.span
        className="bg-pishnam-gold-500 ring-pishnam-gold-500/25 -mt-1 size-2 rounded-full ring-2"
        style={reduced ? undefined : { scale, opacity }}
      />
    </div>
  );
}

/**
 * The lit head of the signal, riding the leading edge of the trace. Driven by
 * `y` in pixels off the measured container height rather than a `top`
 * percentage, to keep it on the compositor instead of triggering layout on
 * every scroll frame.
 *
 * `top-0` is load-bearing: without it the span takes its static position, which
 * sits *after* the `h-full` track SVG -- i.e. at the container's bottom edge --
 * and `y` then translates it a second full container height down. Transforms
 * count toward scrollable overflow, so that added ~1700px of empty scroll below
 * the footer with a gold dot drifting through it.
 */
function SpineHead({ progress, height }: { progress: MotionValue<number>; height: number }) {
  const y = useTransform(progress, [0, 1], [0, height]);
  const opacity = useTransform(progress, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);

  return (
    <motion.span
      className="bg-pishnam-gold-500 absolute inset-x-0 top-0 mx-auto -mt-1.5 size-3 rounded-full shadow-[0_0_12px_3px_var(--color-pishnam-gold-500)]"
      style={{ y, opacity }}
    />
  );
}
