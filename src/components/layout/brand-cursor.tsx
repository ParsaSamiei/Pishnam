"use client";

import { useEffect, useRef } from "react";
import { useBrandCursorEnabled } from "./use-brand-cursor";

const TRAIL = 5;
const LERP = 0.28;
const TRAIL_LERP = 0.18;

const INTERACTIVE =
  "a[href], button:not(:disabled), [role='button'], [role='link'], [role='menuitem'], summary, label, select, input[type='button'], input[type='submit'], input[type='reset'], input[type='checkbox'], input[type='radio'], input[type='file'], input[type='color'], input[type='range'], [data-cursor='interactive']";

const TEXT =
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='file']):not([type='color']):not([type='range']):not([type='hidden']), textarea, [contenteditable='true'], [data-cursor='text']";

const NATIVE = "iframe, [data-cursor='native']";

type Mode = "idle" | "hover" | "text" | "native" | "hidden";

function closest(target: EventTarget | null, selector: string) {
  return target instanceof Element ? target.closest(selector) : null;
}

function modeFromTarget(target: EventTarget | null): Mode {
  if (closest(target, NATIVE)) return "native";
  if (closest(target, TEXT)) return "text";
  if (closest(target, INTERACTIVE)) return "hover";
  return "idle";
}

/**
 * Public-site cursor: a miniature of the Pishnam robot badge that replaces
 * the OS pointer on fine-pointer desktops. Eyes lean with movement, a gold
 * via-ring blooms over clickable things, PCB-pad sparks trail the path, and
 * a press pulse fires on click -- the same navy / gold / steel language as
 * CircuitBackground and the logo.
 *
 * Rendering is DOM-direct after mount so pointer frames never go through
 * React. Native I-beam and iframe cursors are restored rather than faked.
 */
export function BrandCursor() {
  const enabled = useBrandCursorEnabled();
  const rootRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const rootEl = rootRef.current;
    const faceEl = faceRef.current;
    const coreEl = coreRef.current;
    const trailEl = trailRef.current;
    if (!rootEl || !faceEl || !coreEl || !trailEl) return;
    const root: HTMLDivElement = rootEl;
    const face: HTMLDivElement = faceEl;
    const core: HTMLDivElement = coreEl;
    const pads = Array.from(trailEl.children) as HTMLElement[];

    let destX = -80;
    let destY = -80;
    let x = destX;
    let y = destY;
    let vx = 0;
    let vy = 0;
    let pupilX = 0;
    let pupilY = 0;
    let antenna = 0;
    let visible = false;
    let pressed = false;
    let mode: Mode = "hidden";
    let blinkUntil = 0;
    let nextBlink = performance.now() + 2800;
    let raf = 0;

    const trail = Array.from({ length: TRAIL }, () => ({ x, y }));

    function setMode(next: Mode) {
      if (mode === next) return;
      mode = next;
      root.dataset.mode = next;
    }

    function applyModeFrom(target: EventTarget | null) {
      if (!visible) {
        setMode("hidden");
        return;
      }
      setMode(modeFromTarget(target));
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      destX = event.clientX;
      destY = event.clientY;
      if (!visible) {
        visible = true;
        x = destX;
        y = destY;
        for (const point of trail) {
          point.x = destX;
          point.y = destY;
        }
      }
      applyModeFrom(event.target);
    }

    function onOver(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      applyModeFrom(event.target);
    }

    function onDown(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !visible) return;
      pressed = true;
      root.dataset.pressed = "true";
      root.classList.remove("is-clicking");
      void root.offsetWidth;
      root.classList.add("is-clicking");
    }

    function onUp(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pressed = false;
      delete root.dataset.pressed;
      applyModeFrom(event.target);
    }

    function onLeave() {
      visible = false;
      pressed = false;
      delete root.dataset.pressed;
      setMode("hidden");
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick);

      const dx = destX - x;
      const dy = destY - y;
      x += dx * LERP;
      y += dy * LERP;
      vx += (dx - vx) * 0.12;
      vy += (dy - vy) * 0.12;

      if (now >= nextBlink) {
        blinkUntil = now + 110;
        nextBlink = now + 2400 + Math.random() * 3200;
      }

      const speed = Math.min(1, Math.hypot(vx, vy) / 42);
      const lookX = Math.max(-1, Math.min(1, vx / 28));
      const lookY = Math.max(-1, Math.min(1, vy / 28));
      pupilX += (lookX - pupilX) * 0.2;
      pupilY += (lookY - pupilY) * 0.2;
      antenna += (-lookX * 14 - antenna) * 0.16;

      const hover = mode === "hover";
      const showFace = visible && mode !== "text" && mode !== "native";
      const squash = pressed ? 0.86 : hover ? 1.12 : 1;

      face.style.opacity = showFace ? "1" : "0";
      face.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      core.style.transform = `translate(-50%, -45%) scale(${squash})`;
      core.style.setProperty("--pupil-x", `${pupilX * 1.6}px`);
      core.style.setProperty("--pupil-y", `${pupilY * 1.4}px`);
      core.style.setProperty("--antenna-tilt", `${antenna}deg`);
      core.classList.toggle("is-blinking", now < blinkUntil);
      core.classList.toggle("is-hover", hover);

      let tx = x;
      let ty = y;
      pads.forEach((pad, i) => {
        const point = trail[i];
        if (!point) return;
        const follow = TRAIL_LERP * (1 - i * 0.08);
        point.x += (tx - point.x) * follow;
        point.y += (ty - point.y) * follow;
        tx = point.x;
        ty = point.y;
        const fade = showFace ? (1 - i / TRAIL) * (0.22 + speed * 0.45) : 0;
        pad.style.opacity = String(fade);
        pad.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`;
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      data-brand-cursor-root=""
      data-mode="hidden"
      aria-hidden="true"
      className="brand-cursor pointer-events-none fixed inset-0 z-200 overflow-hidden"
    >
      <div ref={trailRef} className="brand-cursor-trail">
        {Array.from({ length: TRAIL }, (_, i) => (
          <span key={i} className="brand-cursor-via" />
        ))}
      </div>
      <div ref={faceRef} className="brand-cursor-face">
        <div ref={coreRef} className="brand-cursor-core">
          <span className="brand-cursor-ring" />
          <span className="brand-cursor-pulse" />
          <RobotMark />
        </div>
      </div>
    </div>
  );
}

function RobotMark() {
  return (
    <svg
      className="brand-cursor-mark"
      viewBox="0 0 36 44"
      width="36"
      height="44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="brand-cursor-antenna">
        <rect x="17" y="1" width="2" height="8" rx="0.6" fill="#18222D" />
        <rect
          x="13.5"
          y="0"
          width="9"
          height="6"
          rx="1"
          fill="#F2F2F0"
          stroke="#18222D"
          strokeWidth="1.2"
        />
        <rect x="13.5" y="2.8" width="9" height="1.5" fill="#E5001A" />
      </g>
      <rect x="5" y="8" width="26" height="30" rx="5" fill="#18222D" />
      <rect x="6.5" y="9.5" width="23" height="27" rx="4" fill="#3B5E82" />
      <rect x="8" y="11" width="20" height="16" rx="2.5" fill="#E6A817" />
      <g className="brand-cursor-eyes">
        <circle cx="14.5" cy="18.5" r="4.1" fill="#F2F2F0" />
        <circle cx="21.5" cy="18.5" r="4.1" fill="#F2F2F0" />
        <g className="brand-cursor-pupils">
          <circle cx="14.5" cy="18.5" r="1.85" fill="#18222D" />
          <circle cx="21.5" cy="18.5" r="1.85" fill="#18222D" />
        </g>
        <g className="brand-cursor-lids">
          <rect x="10.2" y="14.2" width="8.6" height="8.6" rx="4.1" fill="#E6A817" />
          <rect x="17.2" y="14.2" width="8.6" height="8.6" rx="4.1" fill="#E6A817" />
        </g>
      </g>
      <rect x="10" y="29.5" width="16" height="5.5" rx="1.4" fill="#18222D" />
      <rect x="14.5" y="31.2" width="7" height="2" rx="1" fill="#E6A817" />
    </svg>
  );
}
