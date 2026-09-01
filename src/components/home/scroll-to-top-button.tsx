"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";

/** Past the hero fold — the spine trace is doing its job by then. */
const SHOW_AFTER_PX = 480;

export function ScrollToTopButton() {
  const t = useTranslations("home");
  const reduced = useReducedMotionSafe();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      aria-label={t("scrollToTop")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 z-30 size-11 rounded-full",
        "inset-e-4 sm:inset-e-6",
        "ring-pishnam-gold-500/15 shadow-[0_0_6px_1px_rgb(230_168_23_/_0.18)] ring-1",
        "hover:shadow-[0_0_8px_2px_rgb(230_168_23_/_0.28)]",
        "transition-[opacity,transform] duration-300 motion-reduce:transition-none",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0 motion-reduce:translate-y-0",
      )}
    >
      <ChevronUp aria-hidden="true" className="size-5" />
    </Button>
  );
}
