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
      variant="secondary"
      size="icon"
      aria-label={t("scrollToTop")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
      className={cn(
        "size-14 rounded-full",
        "bg-pishnam-steel-600 text-pishnam-off-white hover:bg-pishnam-steel-600/90",
        "ring-pishnam-steel-600/35 shadow-[0_4px_14px_rgb(24_34_45/0.22)] ring-1",
        "hover:shadow-[0_6px_16px_rgb(24_34_45/0.32)]",
        "transition-[opacity,transform,box-shadow,background-color] duration-300 motion-reduce:transition-none",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0 motion-reduce:translate-y-0",
      )}
    >
      <ChevronUp aria-hidden="true" className="size-6" />
    </Button>
  );
}
