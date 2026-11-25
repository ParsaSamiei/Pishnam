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
          <div className="bg-bg-surface-alt relative aspect-square w-full overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                className="object-contain p-5"
                sizes="(min-width: 1280px) 240px, (min-width: 1024px) 280px, 50vw"
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <Package className="size-7" aria-hidden="true" />
              </div>
            )}
            {releaseCount > 0 && (
              <span className="bg-pishnam-navy-900/85 text-pishnam-off-white absolute inset-s-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                {releaseCountLabel}
              </span>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-text-primary text-sm font-bold">{title}</h3>
            {excerpt && <p className="text-text-secondary mt-1 line-clamp-2 text-xs">{excerpt}</p>}
          </CardContent>
        </Card>
      </TiltCard>
    </Link>
  );
}
