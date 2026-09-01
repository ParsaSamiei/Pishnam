"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SocialChannelIcon } from "@/components/contact/social-channel-icon";
import { Button } from "@/components/ui/button";
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

function toGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

type FloatingContactButtonProps = {
  address: string | null;
  mapsQuery: string | null;
  phones: string[];
  socialLinks: SocialLink[];
};

export function FloatingContactButton({
  address,
  mapsQuery,
  phones,
  socialLinks,
}: FloatingContactButtonProps) {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const isFa = locale === "fa";
  const [open, setOpen] = useState(false);

  const hasContent = Boolean(address) || phones.length > 0 || socialLinks.length > 0;

  if (!hasContent) return null;

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="icon"
        aria-label={t("floatingContact.open")}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-20 z-30 size-11 rounded-full",
          "inset-e-4 sm:inset-e-6",
          "ring-pishnam-gold-500/15 shadow-[0_0_6px_1px_rgb(230_168_23_/_0.18)] ring-1",
          "hover:shadow-[0_0_8px_2px_rgb(230_168_23_/_0.28)]",
          "transition-[opacity,transform] duration-300 motion-reduce:transition-none",
        )}
      >
        <MessageCircle aria-hidden="true" className="size-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("floatingContact.title")}</DialogTitle>
            <DialogDescription>{t("floatingContact.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            {address && mapsQuery ? (
              <div className="flex items-start gap-3">
                <MapPin
                  className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {t("floatingContact.address")}
                  </p>
                  <a
                    href={toGoogleMapsUrl(mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${address} (${tNav("opensInNewTab")})`}
                    className="text-text-secondary hover:text-pishnam-gold-600 mt-1 block cursor-pointer text-sm leading-snug whitespace-pre-line transition-colors duration-200"
                  >
                    {address}
                  </a>
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
