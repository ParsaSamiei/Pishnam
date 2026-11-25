import { cn } from "@/lib/utils";

interface DatasheetSpecStripProps {
  slug: string;
  eyebrow: string;
  meta: string[];
  className?: string;
}

/**
 * Silkscreen legend strip — the memorable hardware cue on datasheet pages.
 * Reads like a PCB legend: pin-header dots, a part number, a role label.
 */
export function DatasheetSpecStrip({ slug, eyebrow, meta, className }: DatasheetSpecStripProps) {
  return (
    <div
      className={cn(
        "border-border bg-pishnam-navy-900 text-pishnam-off-white flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-4 py-3",
        className,
      )}
    >
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="bg-pishnam-gold-500 size-1.5 rounded-full" />
        <span className="bg-pishnam-gold-500 size-1.5 rounded-full" />
        <span className="bg-pishnam-gold-500/50 size-1.5 rounded-full" />
      </span>
      <p className="font-mono text-sm font-semibold tracking-[0.18em] uppercase" dir="ltr">
        {slug}
      </p>
      <span className="bg-pishnam-gold-500/80 hidden h-3 w-px sm:block" aria-hidden="true" />
      <p className="text-pishnam-gold-500 text-[11px] font-bold tracking-[0.22em] uppercase">
        {eyebrow}
      </p>
      {meta.length > 0 ? (
        <ul className="text-pishnam-off-white/70 ms-auto flex flex-wrap gap-x-3 text-xs">
          {meta.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
