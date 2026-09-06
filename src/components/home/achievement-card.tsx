"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "next-intl";
import { Expand, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { Pop } from "@/components/motion/pop";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  title: string;
  competition: string;
  year: number;
  result: string;
  photo: string;
  scopeLabel: string;
}

export function AchievementCard({
  title,
  competition,
  year,
  result,
  photo,
  scopeLabel,
}: AchievementCardProps) {
  const locale = useLocale();
  const isFa = locale === "fa";
  const viewLabel = isFa ? "مشاهده" : "View";
  const [open, setOpen] = useState(false);
  const meta = `${competition} · ${year} · ${scopeLabel}`;

  return (
    <>
      {/* Lift without tilt, for the same reason as the download tiles: these sit
          four across, and four photos tipping on their own axes reads as noise. */}
      <TiltCard tilt={false}>
        <Card className={cn("p-0", cardHoverClass)}>
          <CardHoverRule />
          <div className="bg-bg-surface-alt group relative aspect-[4/3] w-full overflow-hidden">
            {photo ? (
              <>
                <Image
                  src={photo}
                  alt={title}
                  fill
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="(min-width: 1024px) 320px, 50vw"
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
              </>
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <Trophy className="size-8" aria-hidden="true" />
              </div>
            )}
            <Pop className="bg-pishnam-gold-500 text-pishnam-navy-900 pointer-events-none absolute start-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-bold">
              {year}
            </Pop>
            <span className="bg-pishnam-navy-900/85 text-pishnam-off-white pointer-events-none absolute end-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
              {scopeLabel}
            </span>
          </div>
          <CardContent className="p-4">
            <p className="text-pishnam-steel-600 text-xs font-semibold tracking-wide uppercase">
              {competition}
            </p>
            <h3 className="text-text-primary mt-1 font-bold">{title}</h3>
            <p className="text-text-secondary mt-1 text-sm">{result}</p>
          </CardContent>
        </Card>
      </TiltCard>

      {photo ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-1">
                  <p>{meta}</p>
                  <p>{result}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="bg-bg-surface-alt relative mt-2 aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo}
                alt={title}
                fill
                className="object-contain p-2"
                sizes="(min-width: 768px) 720px, 100vw"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
