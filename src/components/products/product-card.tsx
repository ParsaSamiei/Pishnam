import Image from "next/image";
import { Package } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  price?: string | null;
  tags: string[];
}

export function ProductCard({ slug, title, excerpt, image, price, tags }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block h-full cursor-pointer">
      <TiltCard className="h-full" tilt={false}>
        <Card className={cn("h-full overflow-hidden p-0", cardHoverClass)}>
          <CardHoverRule />
          <div className="bg-bg-surface-alt relative aspect-[4/3] w-full overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1280px) 280px, (min-width: 768px) 33vw, 90vw"
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <Package className="size-8" aria-hidden="true" />
              </div>
            )}
          </div>
          <CardContent className="flex flex-col gap-2 p-4">
            {tags.length > 0 ? (
              <p className="text-pishnam-gold-600 text-[11px] font-semibold tracking-wide uppercase">
                {tags.join(" · ")}
              </p>
            ) : null}
            <h3 className="text-text-primary text-base font-bold">{title}</h3>
            {excerpt ? <p className="text-text-secondary line-clamp-2 text-sm">{excerpt}</p> : null}
            {price ? (
              <p className="text-text-primary mt-auto pt-1 text-sm font-semibold">{price}</p>
            ) : null}
          </CardContent>
        </Card>
      </TiltCard>
    </Link>
  );
}
