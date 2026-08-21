import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass, cardHoverIconClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

interface AudienceEntryCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  accent?: "gold" | "steel";
}

export function AudienceEntryCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
  accent = "gold",
}: AudienceEntryCardProps) {
  const locale = useLocale();
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <Link href={href} className="group block h-full cursor-pointer">
      {/* Lift and tilt come from Motion rather than a CSS transition, so the
          hover state composes with the reveal transform instead of fighting
          it -- see components/motion/tilt-card.tsx. */}
      <TiltCard className="h-full">
        <Card className={cn("h-full", cardHoverClass)}>
          <CardHoverRule />
          <CardContent className="flex h-full flex-col gap-4 p-6">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-lg",
                cardHoverIconClass,
                accent === "gold"
                  ? "bg-pishnam-gold-500/15 text-pishnam-gold-600"
                  : "bg-pishnam-steel-600/15 text-pishnam-steel-600",
              )}
            >
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-text-primary text-lg font-bold">{title}</h3>
              <p className="text-text-secondary mt-2 text-sm">{description}</p>
            </div>
            <span className="text-pishnam-steel-600 inline-flex items-center gap-1.5 text-sm font-semibold">
              {cta}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
      </TiltCard>
    </Link>
  );
}
