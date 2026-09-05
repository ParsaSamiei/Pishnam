"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useScrolledPast } from "@/components/motion/use-scrolled-past";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useIsRtl } from "@/components/motion/use-is-rtl";
import { DURATION, EASE_OUT, SPRING, directionSign } from "@/lib/motion";
import { LanguageSwitch } from "./language-switch";
import { ThemeToggle } from "./theme-toggle";
import { SiteSearch } from "@/components/search/site-search";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/about-us", key: "about" },
  { href: "/courses", key: "courses" },
  { href: "/classes", key: "classes" },
  { href: "/gallery", key: "gallery" },
  { href: "/videos", key: "videos" },
  { href: "/downloads", key: "downloads" },
  { href: "/blog", key: "blog" },
  { href: "/contact-us", key: "contact" },
] as const;

// const EXTERNAL_LINKS = [
//   { href: "https://pishcup.com", key: "pishcup" },
//   { href: "https://pishtalk.com", key: "pishtalk" },
// ] as const;

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
  const [searchOpen, setSearchOpen] = useState(false);
  const scrolled = useScrolledPast(80);
  const reduced = useReducedMotionSafe();
  const isRtl = useIsRtl();
  // Panel parks off the inline-start edge: left in LTR, right in Persian.
  const drawerOffscreenX = `${-100 * directionSign(isRtl)}%`;
  const drawerTransition = reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE_OUT };

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
            className={cn("relative flex items-center overflow-hidden", !reduced && "logo-shine")}
            animate={reduced ? undefined : { scale: scrolled ? 0.88 : 1 }}
            transition={SPRING}
          >
            <Image
              src="/brand/pishnam-logo.png"
              alt=""
              width={40}
              height={44}
              className="relative h-10 w-auto"
              priority
              loading="eager"
            />
          </motion.span>
          <span className="text-text-primary hidden text-base font-bold sm:inline">
            {tBrand("name")}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  headerNavLinkClass,
                  "cursor-pointer py-2",
                  active && "bg-pishnam-gold-500/12 text-pishnam-gold-600",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
          <span className="bg-border mx-1 h-4 w-px shrink-0" aria-hidden="true" />
          {/* {EXTERNAL_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t(item.key)} (${t("opensInNewTab")})`}
              className={cn(
                headerNavLinkClass,
                "inline-flex cursor-pointer items-center gap-1.5 py-2",
              )}
            >
              {t(item.key)}
              <ExternalLink className="size-3.5 opacity-60" aria-hidden="true" />
            </a>
          ))} */}
        </nav>

        <div className="flex items-center gap-1">
          <SiteSearch
            triggerClassName={headerControlClass}
            open={searchOpen}
            onOpenChange={setSearchOpen}
          />
          <ThemeToggle className={headerControlClass} />
          <LanguageSwitch className={headerControlClass} />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/enroll">{t("enroll")}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("xl:hidden", headerControlClass)}
            aria-label={t("openMenu")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <AnimatePresence>
          {mobileOpen ? (
            <Dialog.Portal forceMount key="mobile-nav">
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="bg-pishnam-navy-900/60 fixed inset-0 z-50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={drawerTransition}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  className="border-border bg-bg-surface fixed inset-s-0 top-0 z-50 flex h-dvh max-h-dvh w-full max-w-xs flex-col overflow-y-auto border-e p-6 shadow-lg outline-none sm:max-w-sm"
                  initial={{ x: drawerOffscreenX }}
                  animate={{ x: 0 }}
                  exit={{ x: drawerOffscreenX }}
                  transition={drawerTransition}
                >
                  <VisuallyHidden>
                    <Dialog.Title>{t("openMenu")}</Dialog.Title>
                  </VisuallyHidden>
                  <Dialog.Close className="focus:ring-pishnam-gold-500 absolute inset-e-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-none">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
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
                            "cursor-pointer py-3 text-base",
                            active && "bg-pishnam-gold-500/12 text-pishnam-gold-600",
                          )}
                        >
                          {t(item.key)}
                        </Link>
                      );
                    })}
                    {/* <div className="border-border my-2 border-t pt-2"> */}
                    {/* {EXTERNAL_LINKS.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${t(item.key)} (${t("opensInNewTab")})`}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            headerNavLinkClass,
                            "inline-flex w-full cursor-pointer items-center justify-between gap-2 py-3 text-base",
                          )}
                        >
                          {t(item.key)}
                          <ExternalLink className="size-4 opacity-60" aria-hidden="true" />
                        </a>
                      ))} */}
                    {/* </div> */}
                    <button
                      type="button"
                      className={cn(headerNavLinkClass, "cursor-pointer py-3 text-start text-base")}
                      onClick={() => {
                        setMobileOpen(false);
                        window.setTimeout(() => setSearchOpen(true), 200);
                      }}
                    >
                      {t("search")}
                    </button>
                    <Button asChild size="lg" className="mt-4">
                      <Link href="/enroll" onClick={() => setMobileOpen(false)}>
                        {t("enroll")}
                      </Link>
                    </Button>
                  </nav>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </header>
  );
}
