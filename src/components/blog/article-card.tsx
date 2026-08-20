import Image from "next/image";
import { Newspaper } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: Date;
  locale: AppLocale;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
  locale,
}: ArticleCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden p-0 transition-shadow group-hover:shadow-lg">
        <div className="bg-bg-surface-alt relative aspect-[16/9] w-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 380px, 100vw"
            />
          ) : (
            <div className="text-text-secondary flex h-full items-center justify-center">
              <Newspaper className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <time dateTime={publishedAt.toISOString()} className="text-text-secondary text-xs">
            {formatDate(publishedAt, locale)}
          </time>
          <h3 className="text-text-primary mt-1.5 line-clamp-2 font-bold">{title}</h3>
          <p className="text-text-secondary mt-2 line-clamp-2 text-sm">{excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
