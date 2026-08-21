"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server cannot know the visitor's preference, so it renders the animated
// markup and the client corrects it on the commit after hydration.
const getServerSnapshot = () => false;

/**
 * `prefers-reduced-motion`, but safe to branch on during render.
 *
 * Motion's own `useReducedMotion()` reads the media query eagerly and seeds
 * `useState` with it, so on a reduced-motion machine it returns `true` on the
 * client's *first* render while the server rendered `false`. Anything we choose
 * with it -- which variant set is used, whether a `y` key is in a style object,
 * whether `TiltCard` renders a motion element at all -- then differs from the
 * server HTML, and React reports a hydration mismatch.
 *
 * `useSyncExternalStore` resolves that by design: React reads
 * `getServerSnapshot` during the hydration render, so it matches the server,
 * then re-renders with the real value. The single frame in which a
 * reduced-motion visitor still holds an animated initial state is covered by
 * the `prefers-reduced-motion` rule on `[data-motion-reveal]` in
 * styles/globals.css, which beats the inline style on `!important` -- so no
 * content is ever invisible, even for that frame.
 *
 * It also subscribes, which Motion's hook does not: toggling the OS setting
 * takes effect without a reload.
 *
 * Props that never reach the server HTML (`transition`, `whileHover`) can use
 * Motion's hook directly; only rendered output needs this one.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
