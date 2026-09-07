"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { formatStatCount } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";

export type HeroStatItem = {
  key: string;
  value: number;
  label: string;
};

interface HeroStatsProps {
  locale: AppLocale;
  items: HeroStatItem[];
  className?: string;
}

function AnimatedStatValue({
  value,
  locale,
  inView,
}: {
  value: number;
  locale: AppLocale;
  inView: boolean;
}) {
  const reduced = useReducedMotionSafe();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;

    const controls = animate(0, value, {
      duration: DURATION.slow + 0.45,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  const shown = reduced ? value : display;
  const formatted = formatStatCount(shown, locale);
  const finalLabel = `${formatStatCount(value, locale)}+`;

  return (
    <span className="tabular-nums" aria-label={finalLabel}>
      <span aria-hidden="true">
        {formatted}
        <span className="text-pishnam-gold-500/80 ms-0.5 text-[0.65em] font-bold">+</span>
      </span>
    </span>
  );
}

/**
 * Scoreboard strip under the hero CTAs: three marketing counts that tick up
 * once when they enter view. Numbers are admin-authored (not DB-derived).
 */
export function HeroStats({ locale, items, className }: HeroStatsProps) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });

  if (items.length === 0) return null;

  return (
    <ul
      ref={ref}
      className={cn(
        "border-border/80 mt-10 flex max-w-xl flex-col border-t sm:flex-row",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.key}
          className={cn(
            "border-border/80 flex min-w-0 flex-1 flex-col items-start gap-1 py-4 sm:items-center sm:px-5 sm:py-3 sm:text-center",
            index > 0 && "border-t sm:border-s sm:border-t-0",
            index === 0 && "sm:ps-0",
            index === items.length - 1 && "sm:pe-0",
          )}
        >
          <p className="text-pishnam-gold-500 text-3xl leading-none font-extrabold tracking-tight sm:text-4xl">
            <AnimatedStatValue value={item.value} locale={locale} inView={inView} />
          </p>
          <p className="text-text-secondary text-xs font-medium sm:text-sm">{item.label}</p>
        </li>
      ))}
    </ul>
  );
}
