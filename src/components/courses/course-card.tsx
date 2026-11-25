import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card className="h-full overflow-hidden p-0 transition-shadow group-hover:shadow-lg">
        <div className="bg-bg-surface-alt relative aspect-[16/10] w-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              className="object-contain"
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
    </Link>
  );
}
