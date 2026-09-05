"use client";

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

  const providerLabel: Record<MapProvider, string> = {
    google: t("googleMaps"),
    balad: t("balad"),
    neshan: t("neshan"),
  };

  return (
    <div className={cn(className)}>
      {icon ? (
        <p className={cn("flex items-start gap-1.5", addressClassName)}>
          {icon}
          <span className="whitespace-pre-line">{address}</span>
        </p>
      ) : (
        <p className={cn("whitespace-pre-line", addressClassName)}>{address}</p>
      )}

      <ul aria-label={t("chooseApp")} className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
        {MAP_PROVIDERS.map((provider) => {
          const label = providerLabel[provider];
          return (
            <li key={provider}>
              <a
                href={toMapUrl(provider, PISHNAM_MAP_SEARCH_QUERY)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("openIn", { service: label })} (${tNav("opensInNewTab")})`}
                className="hover:text-pishnam-gold-500 inline-flex cursor-pointer items-center gap-1 text-xs opacity-80 transition-colors duration-200 hover:opacity-100"
              >
                <span>{label}</span>
                <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
