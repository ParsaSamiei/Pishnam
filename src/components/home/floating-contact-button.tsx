"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AddressMapLinks } from "@/components/contact/address-map-links";
import { SocialChannelIcon } from "@/components/contact/social-channel-icon";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SocialLink } from "@/lib/social-channels";
import { cn } from "@/lib/utils";

function toTelHref(phone: string): string {
  const latin = phone.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return `tel:${latin.replace(/[^\d+]/g, "")}`;
}

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}

type FloatingContactButtonProps = {
  address: string | null;
  phones: string[];
  socialLinks: SocialLink[];
};

export function FloatingContactButton({
  address,
  phones,
  socialLinks,
}: FloatingContactButtonProps) {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const isFa = locale === "fa";
  const reduced = useReducedMotionSafe();
  const [open, setOpen] = useState(false);

  const hasContent = Boolean(address) || phones.length > 0 || socialLinks.length > 0;

  if (!hasContent) return null;

  return (
    <>
      <button
        type="button"
        aria-label={t("floatingContact.open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "group fixed bottom-20 z-30 flex cursor-pointer flex-col items-center gap-2",
          "inset-e-4 border-0 bg-transparent p-0 sm:inset-e-6",
          "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <div className={cn(!reduced && "animate-contact-label-bounce")}>
          <div className="relative">
            <span className="bg-pishnam-gold-500 text-pishnam-navy-900 block rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap shadow-[0_4px_14px_rgb(0_0_0_/_0.14)]">
              {t("floatingContact.open")}
            </span>
            <span
              aria-hidden="true"
              className="border-t-pishnam-gold-500 absolute start-1/2 -bottom-1.5 size-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent"
            />
          </div>
        </div>

        <span className="relative flex size-14 items-center justify-center">
          {!reduced ? (
            <span
              aria-hidden="true"
              className="bg-pishnam-gold-500/35 animate-contact-pulse-ring absolute inset-0 rounded-full"
            />
          ) : null}
          <span className="bg-pishnam-gold-500 group-hover:bg-pishnam-gold-600 relative flex size-14 items-center justify-center rounded-full shadow-[0_4px_16px_rgb(230_168_23_/_0.35)] transition-colors duration-200">
            <MessageCircle aria-hidden="true" className="text-pishnam-navy-900 size-6" />
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("floatingContact.title")}</DialogTitle>
            <DialogDescription>{t("floatingContact.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            {address ? (
              <div className="flex items-start gap-3">
                <MapPin
                  className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary text-sm font-semibold">
                    {t("floatingContact.address")}
                  </p>
                  <AddressMapLinks
                    address={address}
                    addressClassName="text-text-secondary hover:text-pishnam-gold-600 mt-1 block text-sm leading-snug transition-colors duration-200"
                  />
                </div>
              </div>
            ) : null}

            {phones.length > 0 ? (
              <div className="flex items-start gap-3">
                <Phone
                  className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {t("floatingContact.phone")}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {phones.map((phone) => (
                      <li key={phone}>
                        <a
                          href={toTelHref(phone)}
                          className="text-text-secondary hover:text-pishnam-gold-600 inline-flex cursor-pointer items-center transition-colors duration-200"
                        >
                          <span dir="ltr">{isFa ? toPersianDigits(phone) : phone}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {socialLinks.length > 0 ? (
              <div>
                <p className="text-text-primary text-sm font-semibold">{tFooter("follow")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map((link) => {
                    const label = isFa ? link.labelFa : link.labelEn;
                    return (
                      <li key={link.id}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${label} (${tNav("opensInNewTab")})`}
                          className="border-border bg-surface text-text-secondary hover:border-pishnam-gold-500/50 hover:text-pishnam-gold-600 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors duration-200"
                        >
                          <SocialChannelIcon id={link.id} className="size-4 shrink-0" />
                          <span>{label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
