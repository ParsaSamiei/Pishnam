import { Link } from "@/lib/i18n/navigation";
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
  activeSlug,
}: {
  tags: TeamTagNavItem[];
  appLocale: AppLocale;
  isFa: boolean;
  activeSlug?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <div
      className="mb-10 flex flex-wrap gap-2"
      role="navigation"
      aria-label={isFa ? "دسته‌بندی پرسنل" : "Team categories"}
    >
      <Link
        href="/about-us/team"
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          !activeSlug
            ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
            : "border-border text-text-secondary hover:bg-bg-surface-alt",
        )}
      >
        {isFa ? "همه دسته‌ها" : "All categories"}
      </Link>
      {tags.map((tag) => {
        const label = pickLocaleField(tag.nameFa, tag.nameEn, appLocale);
        const isActive = activeSlug === tag.slug;
        return (
          <Link
            key={tag.slug}
            href={`/about-us/team/${tag.slug}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                : "border-border text-text-secondary hover:bg-bg-surface-alt",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
