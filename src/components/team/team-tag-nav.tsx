"use client";

import { useEffect, useState } from "react";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

export type TeamTagNavItem = {
  slug: string;
  nameFa: string;
  nameEn: string;
};

export function TeamTagNav({
  tags,
  appLocale,
  isFa,
}: {
  tags: TeamTagNavItem[];
  appLocale: AppLocale;
  isFa: boolean;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      setActiveSlug(hash || null);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  if (tags.length === 0) return null;

  return (
    <div
      className="mb-10 flex flex-wrap gap-2"
      role="navigation"
      aria-label={isFa ? "دسته‌بندی پرسنل" : "Team categories"}
    >
      {tags.map((tag) => {
        const label = pickLocaleField(tag.nameFa, tag.nameEn, appLocale);
        const isActive = activeSlug === tag.slug;
        return (
          <a
            key={tag.slug}
            href={`#${tag.slug}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                : "border-border text-text-secondary hover:bg-bg-surface-alt",
            )}
            aria-current={isActive ? "true" : undefined}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
