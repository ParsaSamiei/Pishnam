import Image from "next/image";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AchievementCardProps {
  title: string;
  competition: string;
  year: number;
  result: string;
  photo: string;
}

export function AchievementCard({ title, competition, year, result, photo }: AchievementCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-bg-surface-alt relative aspect-[4/3] w-full">
        {photo ? (
          <Image
            src={photo}
            alt={title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 320px, 50vw"
          />
        ) : (
          <div className="text-text-secondary flex h-full items-center justify-center">
            <Trophy className="size-8" aria-hidden="true" />
          </div>
        )}
        <span className="bg-pishnam-gold-500 text-pishnam-navy-900 absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold">
          {year}
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
  );
}
