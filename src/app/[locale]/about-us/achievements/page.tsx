import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { AchievementCard } from "@/components/home/achievement-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/about-us/achievements"),
    title: locale === "fa" ? "افتخارات و جوایز" : "Achievements & Awards",
  };
}

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const achievements = await prisma.achievement.findMany({ orderBy: { year: "desc" } });

  return (
    <>
      <PageHeader
        title={isFa ? "افتخارات و جوایز" : "Achievements & Awards"}
        subtitle={
          isFa
            ? "نتایج دانش‌آموزان پیشنام در مسابقات ملی و بین‌المللی روبوکاپ."
            : "Pishnam students' results at national and international RoboCup competitions."
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {achievements.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "افتخاری ثبت نشده است." : "No achievements recorded yet."}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={pickLocaleField(achievement.titleFa, achievement.titleEn, appLocale)}
                competition={achievement.competition}
                year={achievement.year}
                result={achievement.result}
                photo={achievement.photo}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
