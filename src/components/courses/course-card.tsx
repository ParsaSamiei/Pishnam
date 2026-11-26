import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/motion/tilt-card";
import { CardHoverRule, cardHoverClass } from "@/components/motion/card-hover";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tierLabel: string;
}

export function CourseCard({ slug, title, excerpt, coverImage, tierLabel }: CourseCardProps) {
  return (
    <Link href={`/courses/${slug}`} className="group block h-full">
      {/* Same hover as the other three-across grids: Motion lift and tilt, plus
          the shared gold border, glow and top rule. */}
      <TiltCard className="h-full">
        <Card className={cn("h-full overflow-hidden p-0", cardHoverClass)}>
          <CardHoverRule />
          <div className="bg-bg-surface-alt relative aspect-[16/10] w-full overflow-hidden">
            {coverImage ? (
              <Image
                src={coverImage}
                alt=""
                fill
                className="object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
                sizes="(min-width: 1024px) 380px, 100vw"
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <GraduationCap className="size-8" aria-hidden="true" />
              </div>
            )}
            <span className="bg-pishnam-navy-900/85 text-pishnam-off-white absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold">
              {tierLabel}
            </span>
          </div>
          <CardContent className="p-5">
            <h3 className="text-text-primary font-bold">{title}</h3>
            <p className="text-text-secondary mt-1.5 line-clamp-2 text-sm">{excerpt}</p>
          </CardContent>
        </Card>
      </TiltCard>
    </Link>
  );
}
