import Image from "next/image";
import { Package } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

interface SoftwareProductCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  releaseCount: number;
  releaseCountLabel: string;
}

export function SoftwareProductCard({
  slug,
  title,
  excerpt,
  image,
  releaseCount,
  releaseCountLabel,
}: SoftwareProductCardProps) {
  return (
    <Link href={`/downloads/software/${slug}`} className="group block h-full cursor-pointer">
      <TiltCard className="h-full" tilt={false}>
        <Card className={cn("h-full overflow-hidden p-0", cardHoverClass)}>
          <CardHoverRule />
          <div className="bg-bg-surface-alt relative aspect-16/10 w-full overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 380px, 100vw"
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <Package className="size-8" aria-hidden="true" />
              </div>
            )}
            {releaseCount > 0 && (
              <span className="bg-pishnam-navy-900/85 text-pishnam-off-white absolute inset-s-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold">
                {releaseCountLabel}
              </span>
            )}
          </div>
          <CardContent className="p-5">
            <h3 className="text-text-primary font-bold">{title}</h3>
            {excerpt && (
              <p className="text-text-secondary mt-1.5 line-clamp-2 text-sm">{excerpt}</p>
            )}
          </CardContent>
        </Card>
      </TiltCard>
    </Link>
  );
}
