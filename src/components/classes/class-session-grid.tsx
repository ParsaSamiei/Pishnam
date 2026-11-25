import Image from "next/image";
import { Clock, GraduationCap, MapPin } from "lucide-react";
import { formatWeekday } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";

export type ClassSessionCard = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  location: string;
  capacityNote: string | null;
  courseTitle: string | null;
  coverImage: string;
};

export function ClassSessionGrid({
  sessions,
  locale,
  emptyMessage,
}: {
  sessions: ClassSessionCard[];
  locale: AppLocale;
  emptyMessage: string;
}) {
  if (sessions.length === 0) {
    return <p className="text-text-secondary text-center">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sessions.map((session) => (
        <Card key={session.id} className="overflow-hidden p-0">
          <div className="bg-bg-surface-alt relative aspect-[16/10] w-full">
            {session.coverImage ? (
              <Image
                src={session.coverImage}
                alt=""
                fill
                className="object-contain"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            ) : (
              <div className="text-text-secondary flex h-full items-center justify-center">
                <GraduationCap className="size-8" aria-hidden="true" />
              </div>
            )}
          </div>
          <CardContent className="p-5">
            <p className="text-pishnam-steel-600 text-xs font-semibold tracking-wide uppercase">
              {session.courseTitle}
            </p>
            <p className="text-text-primary mt-1 font-bold">
              {formatWeekday(session.weekday, locale)}
            </p>
            <div className="text-text-secondary mt-3 flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                {session.startTime} – {session.endTime}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {session.location}
              </span>
            </div>
            {session.capacityNote && (
              <p className="text-pishnam-gold-600 mt-3 text-xs">{session.capacityNote}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
