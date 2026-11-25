"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { useTheme } from "@/lib/use-theme";

/**
 * The hero's backdrop: the dotted board pattern from the original static
 * markup, now drifting slightly as the band scrolls past, plus a gold trace
 * that routes itself across the bottom of the band on load and hands off to
 * the `ScrollSpine` below.
 *
 * The drift is deliberately contained -- the pattern moves, its opacity does
 * not, so the navy band keeps its weight all the way to the seam instead of
 * dissolving into the next section.
 */
export function HeroBackdrop() {
  // Motion's own hook, not `useReducedMotionSafe`: the only things it decides
  // here are the drift *distance* and the trace's `transition`, neither of
  // which changes the set of style keys or attributes rendered on the server,
  // so there is nothing for hydration to disagree about.
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -24]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Dot field is over-sized vertically so the drift can never expose an
          uncovered edge at either end of the band. `y` stays in the style even
          when the drift is zero -- dropping the key would make the client's
          first render disagree with the server's `transform: none`. */}
      <motion.div
        className="absolute inset-x-0 -inset-y-8 opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-pishnam-gold-500) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          y,
        }}
      />

      {/* Gives the band form rather than leaving it a flat fill -- a faint
          lift under the header and a deepening toward the seam read as a lit
          surface, which is also what lets the dot field register at all
          without raising its opacity into visibility as a pattern in its own
          right. Tuned separately per theme: the dark version assumes a navy
          floor with real headroom to deepen into; on the light (off-white)
          page background the same 30% black falloff would just muddy it, so
          that version leans much lighter. */}
      <div
        className={
          theme === "dark"
            ? "absolute inset-0 bg-linear-to-b from-white/[0.05] via-transparent to-black/30"
            : "absolute inset-0 bg-linear-to-b from-black/[0.03] via-transparent to-black/[0.07]"
        }
      />

      {/* Steel wash in the far corner, on the axis the showcase does not
          occupy, so the two halves of the band are lit differently rather than
          both leaning on the same gold bloom. */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_0%,rgb(59_94_130/0.28),transparent_70%)] rtl:bg-[radial-gradient(70%_60%_at_85%_0%,rgb(59_94_130/0.28),transparent_70%)]" />

      {/* Right-angle runs only: with preserveAspectRatio="none" a diagonal
          would skew, but axis-aligned segments stay square.
          No non-scaling-stroke here either -- it makes Chromium measure the
          `pathLength` dash in screen space (1544px across a 1440px band) while
          normalizing against the 1304-unit path, so the trace stops ~240px
          short of the far edge and never finishes drawing. */}
      <svg
        className="absolute inset-x-0 bottom-0 h-20 w-full rtl:-scale-x-100"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M0 62 H240 V26 H520 V62 H880 V30 H1200"
          fill="none"
          stroke="var(--color-pishnam-gold-500)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.6, ease: EASE_OUT, delay: DURATION.fast }
          }
        />
      </svg>
    </div>
  );
}
