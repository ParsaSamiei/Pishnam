"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Menu, Search } from "lucide-react";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useScrolledPast } from "@/components/motion/use-scrolled-past";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { SPRING } from "@/lib/motion";
import { LanguageSwitch } from "./language-switch";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/about", key: "about" },
  { href: "/courses", key: "courses" },
  { href: "/classes", key: "classes" },
  { href: "/videos", key: "videos" },
  { href: "/downloads", key: "downloads" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolledPast(80);
  const reduced = useReducedMotionSafe();

  return (
    /* Condenses once the visitor is into the page. The outer box stays 4rem:
       this header is `sticky`, so it still occupies layout space, and
       animating its height would shorten the document and jump everything
       below it up by the difference mid-scroll. The logo scale and the
       surface/shadow shift carry the same signal with no layout shift. */
    <header
      className={cn(
        "border-border bg-bg-surface/90 sticky top-0 z-40 border-b backdrop-blur",
        "transition-[background-color,box-shadow] duration-300",
        scrolled && "bg-bg-surface/95 shadow-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <motion.span
            className="flex items-center"
            animate={reduced ? undefined : { scale: scrolled ? 0.88 : 1 }}
            transition={SPRING}
          >
            <Image
              src="/brand/pishnam-logo.png"
              alt=""
              width={36}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </motion.span>
          <span className="text-text-primary hidden text-base font-bold sm:inline">
            {tBrand("name")}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active && "bg-bg-surface-alt text-text-primary",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("search")}
            className="hidden sm:inline-flex"
          >
            <Search aria-hidden="true" />
          </Button>
          <ThemeToggle />
          <LanguageSwitch />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/enroll">{t("enroll")}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("openMenu")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start start-0 top-0 h-full max-w-xs translate-x-0 translate-y-0 rounded-none border-0 border-e sm:max-w-sm">
          <VisuallyHidden>
            <DialogTitle>{t("openMenu")}</DialogTitle>
          </VisuallyHidden>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-text-primary hover:bg-bg-surface-alt rounded-md px-3 py-3 text-base font-medium"
              >
                {t(item.key)}
              </Link>
            ))}
            <Button asChild size="lg" className="mt-4">
              <Link href="/enroll" onClick={() => setMobileOpen(false)}>
                {t("enroll")}
              </Link>
            </Button>
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
