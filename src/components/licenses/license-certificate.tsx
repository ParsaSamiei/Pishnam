"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface LicenseCertificateProps {
  title: string;
  issuer?: string | null;
  year?: number | null;
  image: string;
  description?: string | null;
  viewLabel: string;
  className?: string;
}

/**
 * Certificate mount: document-forward frame with a steel/gold seal mark.
 * Click opens a lightbox so visitors can read the scan.
 */
export function LicenseCertificate({
  title,
  issuer,
  year,
  image,
  description,
  viewLabel,
  className,
}: LicenseCertificateProps) {
  const [open, setOpen] = useState(false);
  const meta = [issuer, year != null ? String(year) : null].filter(Boolean).join(" · ");

  return (
    <>
      <div className={cn("group relative flex w-full flex-col text-start", className)}>
        <div
          className={cn(
            "border-pishnam-steel-600/35 bg-bg-surface relative overflow-hidden border p-2.5 shadow-[0_12px_40px_-24px_rgba(24,34,45,0.55)]",
            "transition-[transform,box-shadow] duration-300 ease-out",
            "group-hover:-translate-y-1 group-hover:shadow-[0_22px_48px_-20px_rgba(24,34,45,0.5)]",
            "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0",
          )}
        >
          <div className="border-pishnam-gold-500/40 pointer-events-none absolute inset-0 m-1 border" />
          <div className="bg-bg-surface-alt relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 40vw, 90vw"
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="focus-visible:ring-pishnam-gold-500 absolute inset-0 z-[1] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset"
              aria-label={`${viewLabel}: ${title}`}
            >
              <span
                className="bg-pishnam-navy-900/80 text-pishnam-off-white absolute end-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:opacity-100"
                aria-hidden="true"
              >
                <Expand className="size-3" />
                {viewLabel}
              </span>
            </button>
          </div>
          {/* Wax-seal corner mark — signature of the licenses wall */}
          <span
            className="bg-pishnam-gold-500 text-pishnam-navy-900 ring-bg-surface pointer-events-none absolute -end-1 -top-1 z-10 flex size-8 items-center justify-center rounded-full shadow-sm ring-2"
            aria-hidden="true"
          >
            <BadgeCheck className="size-4" strokeWidth={2.5} />
          </span>
        </div>

        <div className="mt-4 px-0.5">
          <div className="bg-pishnam-gold-500 mb-2.5 h-px w-10" aria-hidden="true" />
          <h2 className="text-text-primary text-base leading-snug font-bold">{title}</h2>
          {meta && <p className="text-pishnam-steel-600 mt-1 text-xs font-medium">{meta}</p>}
          {description && (
            <p className="text-text-secondary mt-2 line-clamp-2 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {(meta || description) && (
              <DialogDescription asChild>
                <div className="space-y-1">
                  {meta && <p>{meta}</p>}
                  {description && <p>{description}</p>}
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="bg-bg-surface-alt relative mt-2 aspect-[3/4] w-full overflow-hidden sm:aspect-[4/3]">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain p-2"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
