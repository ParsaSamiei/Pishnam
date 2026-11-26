"use client";

import { Mailbox, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AddressMapLinks } from "@/components/contact/address-map-links";
import { BranchPhoneNumbers } from "@/components/contact/branch-phone-numbers";
import type { DisplayContactAddress } from "@/lib/contact-addresses";
import { cn } from "@/lib/utils";

interface FooterBranchesProps {
  addresses: DisplayContactAddress[];
  isFa: boolean;
  label: string;
}

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}

/**
 * The footer sits on every page, so a flat list of branches makes its height
 * depend on how many the admin has added. Each branch gets its own closed
 * disclosure: the footer stays short, and a visitor opens only the branch
 * they care about. Details remain in the DOM, reachable by keyboard.
 */
export function FooterBranches({ addresses, isFa, label }: FooterBranchesProps) {
  if (addresses.length === 0) return null;

  return (
    <div className="mt-4 max-w-sm">
      <h3 id="footer-branches-heading" className="text-pishnam-off-white/90 text-sm font-semibold">
        {label}
      </h3>
      <Accordion
        type="multiple"
        role="group"
        aria-labelledby="footer-branches-heading"
        className="mt-1"
      >
        {addresses.map((address) => (
          <AccordionItem key={address.id} value={address.id} className="border-white/10">
            <AccordionTrigger
              className={cn(
                "text-pishnam-off-white/70 hover:text-pishnam-gold-500 focus-visible:ring-pishnam-gold-500 rounded-sm py-2 text-sm transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:outline-none",
                "[&>svg]:text-pishnam-off-white/60",
              )}
            >
              {address.name}
            </AccordionTrigger>
            <AccordionContent className="text-pishnam-off-white/60 pb-2">
              <div role="group" aria-label={address.name} className="pt-1">
                {address.address ? (
                  <AddressMapLinks
                    address={address.address}
                    className="mt-1"
                    addressClassName="text-pishnam-off-white/60 text-sm leading-snug"
                    icon={
                      <MapPin className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                    }
                  />
                ) : null}
                {address.postalCode ? (
                  <p className="text-pishnam-off-white/60 mt-2 flex items-center gap-1.5 text-sm">
                    <Mailbox className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                    <span>
                      {isFa ? "کد پستی: " : "Postal code: "}
                      <span dir="ltr">
                        {isFa ? toPersianDigits(address.postalCode) : address.postalCode}
                      </span>
                    </span>
                  </p>
                ) : null}
                <BranchPhoneNumbers phones={address.phones} isFa={isFa} compact />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
