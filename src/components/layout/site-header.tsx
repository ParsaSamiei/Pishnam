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
  { href: "/about-us", key: "about" },
  { href: "/courses", key: "courses" },
  { href: "/classes", key: "classes" },
  { href: "/videos", key: "videos" },
  { href: "/downloads", key: "downloads" },
  { href: "/blog", key: "blog" },
  { href: "/contact-us", key: "contact" },
] as const;

/** Icon / outline controls in the header: gold wash instead of a near-invisible surface swap. */
const headerControlClass =
  "cursor-pointer transition-[background-color,border-color,color] duration-300 " +
  "hover:border-pishnam-gold-500/45 hover:bg-pishnam-gold-500/12 hover:text-pishnam-gold-600";

const headerNavLinkClass =
  "rounded-md px-3 text-sm font-medium text-text-secondary transition-colors duration-300 " +
  "hover:bg-pishnam-gold-500/12 hover:text-pishnam-gold-600 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pishnam-gold-500 focus-visible:ring-offset-2";

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
                aria-current={active ? "page" : undefined}
                className={cn(
                  headerNavLinkClass,
                  "py-2",
                  active && "bg-pishnam-gold-500/12 text-pishnam-gold-600",
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
            className={cn("hidden sm:inline-flex", headerControlClass)}
          >
            <Search aria-hidden="true" />
          </Button>
          <ThemeToggle className={headerControlClass} />
          <LanguageSwitch className={headerControlClass} />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/enroll">{t("enroll")}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("lg:hidden", headerControlClass)}
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
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    headerNavLinkClass,
                    "py-3 text-base",
                    active && "bg-pishnam-gold-500/12 text-pishnam-gold-600",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
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
