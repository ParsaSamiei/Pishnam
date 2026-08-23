"use client";

import { useSyncExternalStore } from "react";

// Fine pointer + hover + no reduced-motion: the only case where replacing
// the system cursor is both usable and welcome. Touch devices never get a
// custom cursor (hover vs tap), and visitors who asked for less motion keep
// the OS pointer -- see docs/03-design-system.md ("Accessibility baseline").
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function useBrandCursorEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
