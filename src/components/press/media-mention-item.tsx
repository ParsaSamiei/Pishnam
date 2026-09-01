import Image from "next/image";
import { ArrowUpLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

interface MediaMentionItemProps {
  outletName: string;
  headline: string;
  url: string;
  logo: string;
  publishedAt: Date;
  locale: AppLocale;
  opensInNewTabLabel: string;
  readLabel: string;
  className?: string;
}

export function MediaMentionItem({
  outletName,
  headline,
  url,
  logo,
  publishedAt,
  locale,
  opensInNewTabLabel,
  readLabel,
  className,
}: MediaMentionItemProps) {
  const CornerArrow = locale === "fa" ? ArrowUpLeft : ArrowUpRight;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${headline} — ${outletName} (${opensInNewTabLabel})`}
      className={cn(
        "group relative flex cursor-pointer items-stretch gap-4 p-5 transition-colors duration-200 sm:gap-5 sm:p-6",
        "hover:bg-pishnam-gold-500/6 focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/8 sm:size-16">
        <div className="relative size-full">
          <Image src={logo} alt="" fill sizes="64px" className="object-contain" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="bg-pishnam-gold-500/70 w-px shrink-0 self-stretch rounded-full"
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <p className="text-pishnam-steel-600 text-[11px] font-semibold tracking-[0.14em] uppercase">
          {outletName}
        </p>
        <h3 className="text-text-primary group-hover:text-pishnam-gold-600 text-base leading-snug font-bold transition-colors duration-200 sm:text-lg">
          {headline}
        </h3>
        <div className="text-text-secondary mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt, locale)}</time>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span className="text-pishnam-steel-600 group-hover:text-pishnam-gold-600 inline-flex items-center gap-1 font-medium transition-colors duration-200">
            {readLabel}
            <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
          </span>
        </div>
      </div>

      <CornerArrow
        aria-hidden="true"
        className="text-pishnam-gold-500/0 group-hover:text-pishnam-gold-500/80 mt-1 size-4 shrink-0 self-start transition-all duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 rtl:motion-safe:group-hover:-translate-x-0.5"
      />
    </a>
  );
}
