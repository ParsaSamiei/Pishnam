"use client";

import { Download, ExternalLink } from "lucide-react";
import { track } from "@/lib/analytics";

interface ReleaseDownloadButtonProps {
  href: string;
  isExternal: boolean;
  productTitle: string;
  platformLabel: string;
  versionLabel: string;
  label: string;
}

/**
 * Same visual treatment as the plain download/visit link on
 * /downloads/[category], but as a client component so the click can be
 * reported via the `download_click` event already defined in
 * src/lib/analytics.ts (per docs/09-analytics-i18n.md), which the flat
 * DownloadResource list doesn't currently wire up.
 */
export function ReleaseDownloadButton({
  href,
  isExternal,
  productTitle,
  platformLabel,
  versionLabel,
  label,
}: ReleaseDownloadButtonProps) {
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      download={!isExternal}
      onClick={() =>
        track("download_click", {
          category: "software",
          title: `${productTitle} (${platformLabel} ${versionLabel})`,
        })
      }
      className="bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600 inline-flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors"
    >
      {isExternal ? (
        <ExternalLink className="size-4" aria-hidden="true" />
      ) : (
        <Download className="size-4" aria-hidden="true" />
      )}
      {label}
    </a>
  );
}
