"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DatasheetPartCard } from "@/components/datasheets/datasheet-part-card";
import { DatasheetSpecStrip } from "@/components/datasheets/datasheet-spec-strip";

export type DatasheetCatalogItem = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  badge?: string;
};

interface DatasheetCatalogProps {
  parts: DatasheetCatalogItem[];
  isFa: boolean;
}

export function DatasheetCatalog({ parts, isFa }: DatasheetCatalogProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return parts;
    return parts.filter(
      (part) =>
        part.title.toLowerCase().includes(needle) || part.slug.toLowerCase().includes(needle),
    );
  }, [parts, query]);

  const searchLabel = isFa ? "جستجوی قطعه" : "Find a part";
  const emptyLabel = isFa ? "قطعه‌ای با این نام پیدا نشد." : "No part matches that name.";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DatasheetSpecStrip
          slug="parts-bin"
          eyebrow={isFa ? "کاتالوگ" : "Catalog"}
          meta={[isFa ? `${parts.length} قطعه` : `${parts.length} parts`]}
          className="sm:flex-1"
        />
        <label className="border-border bg-bg-surface focus-within:ring-pishnam-gold-500 relative flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 focus-within:ring-2 sm:max-w-xs">
          <Search className="text-text-secondary size-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">{searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchLabel}
            className="text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-secondary mt-10 text-center">{emptyLabel}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((part) => (
            <li key={part.slug}>
              <DatasheetPartCard
                href={`/downloads/datasheets/${part.slug}`}
                title={part.title}
                excerpt={part.excerpt}
                image={part.image}
                slug={part.slug}
                badge={part.badge}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
