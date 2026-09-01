"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  MAP_PROVIDERS,
  PISHNAM_MAP_SEARCH_QUERY,
  toMapUrl,
  type MapProvider,
} from "@/lib/map-navigation";
import { cn } from "@/lib/utils";

type AddressMapLinksProps = {
  address: string;
  className?: string;
  addressClassName?: string;
  icon?: React.ReactNode;
};

export function AddressMapLinks({
  address,
  className,
  addressClassName,
  icon,
}: AddressMapLinksProps) {
  const t = useTranslations("mapNavigation");
  const tNav = useTranslations("nav");
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const providerLabel: Record<MapProvider, string> = {
    google: t("googleMaps"),
    balad: t("balad"),
    neshan: t("neshan"),
  };

  return (
    <div ref={rootRef} className={cn(className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "cursor-pointer border-0 bg-transparent p-0 text-start transition-colors duration-200",
          "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          addressClassName,
        )}
      >
        {icon ? (
          <span className="flex items-start gap-1.5">
            {icon}
            <span className="whitespace-pre-line">{address}</span>
          </span>
        ) : (
          <span className="whitespace-pre-line">{address}</span>
        )}
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={t("chooseApp")}
          className="border-border bg-surface mt-2 w-full min-w-44 overflow-hidden rounded-md border py-1 shadow-sm"
        >
          {MAP_PROVIDERS.map((provider) => {
            const label = providerLabel[provider];
            return (
              <li key={provider} role="none">
                <a
                  role="menuitem"
                  href={toMapUrl(provider, PISHNAM_MAP_SEARCH_QUERY)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("openIn", { service: label })} (${tNav("opensInNewTab")})`}
                  onClick={() => setOpen(false)}
                  className="text-text-secondary hover:bg-bg-surface-alt hover:text-pishnam-gold-600 flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm transition-colors duration-200"
                >
                  <span>{label}</span>
                  <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
