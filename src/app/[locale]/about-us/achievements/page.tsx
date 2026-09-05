import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import {
  ACHIEVEMENT_SCOPES,
  ACHIEVEMENT_SCOPE_LABELS,
  isAchievementScope,
} from "@/lib/achievement-scope";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AchievementCard } from "@/components/home/achievement-card";
import { cn } from "@/lib/utils";

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scope?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const { scope: scopeParam } = await searchParams;
  const activeScope = isAchievementScope(scopeParam) ? scopeParam : undefined;

  const achievements = await prisma.achievement.findMany({
    where: activeScope ? { scope: activeScope } : undefined,
    orderBy: { year: "desc" },
  });

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
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={isFa ? "فیلتر بر اساس سطح مسابقه" : "Filter by competition scope"}
        >
          <Link
            href="/about-us/achievements"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !activeScope
                ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                : "border-border text-text-secondary hover:bg-bg-surface-alt",
            )}
          >
            {isFa ? "همه" : "All"}
          </Link>
          {ACHIEVEMENT_SCOPES.map((scopeValue) => (
            <Link
              key={scopeValue}
              href={{ pathname: "/about-us/achievements", query: { scope: scopeValue } }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeScope === scopeValue
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                  : "border-border text-text-secondary hover:bg-bg-surface-alt",
              )}
            >
              {ACHIEVEMENT_SCOPE_LABELS[appLocale][scopeValue]}
            </Link>
          ))}
        </div>

        {achievements.length === 0 ? (
          <p className="text-text-secondary mt-10 text-center">
            {activeScope
              ? isFa
                ? "افتخاری در این دسته یافت نشد."
                : "No achievements found in this category."
              : isFa
                ? "افتخاری ثبت نشده است."
                : "No achievements recorded yet."}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={pickLocaleField(achievement.titleFa, achievement.titleEn, appLocale)}
                competition={achievement.competition}
                year={achievement.year}
                result={achievement.result}
                photo={achievement.photo}
                scopeLabel={ACHIEVEMENT_SCOPE_LABELS[appLocale][achievement.scope]}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
