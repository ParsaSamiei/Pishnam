import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
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

function tagSlugFromSearch(tag?: string, scope?: string): string | undefined {
  if (tag) return tag;
  if (scope === "INTERNATIONAL") return "international";
  if (scope === "NATIONAL") return "national";
  return undefined;
}

export default async function AchievementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; scope?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const { tag: tagParam, scope: scopeParam } = await searchParams;
  const requestedSlug = tagSlugFromSearch(tagParam, scopeParam);

  const [tags, achievements] = await Promise.all([
    prisma.achievementTag.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.achievement.findMany({
      include: { tag: true },
      orderBy: { year: "desc" },
    }),
  ]);

  const activeSlug =
    requestedSlug &&
    (tags.some((tag) => tag.slug === requestedSlug) ||
      achievements.some((achievement) => achievement.tag.slug === requestedSlug))
      ? requestedSlug
      : undefined;
  const visibleAchievements = activeSlug
    ? achievements.filter((achievement) => achievement.tag.slug === activeSlug)
    : achievements;

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
        {tags.length > 0 && (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={isFa ? "فیلتر بر اساس برچسب" : "Filter by tag"}
          >
            <Link
              href="/about-us/achievements"
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !activeSlug
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                  : "border-border text-text-secondary hover:bg-bg-surface-alt",
              )}
            >
              {isFa ? "همه" : "All"}
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={{ pathname: "/about-us/achievements", query: { tag: tag.slug } }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  activeSlug === tag.slug
                    ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                    : "border-border text-text-secondary hover:bg-bg-surface-alt",
                )}
              >
                {pickLocaleField(tag.nameFa, tag.nameEn, appLocale)}
              </Link>
            ))}
          </div>
        )}

        {visibleAchievements.length === 0 ? (
          <p className={cn("text-text-secondary text-center", tags.length > 0 && "mt-10")}>
            {activeSlug
              ? isFa
                ? "افتخاری در این دسته یافت نشد."
                : "No achievements found in this category."
              : isFa
                ? "افتخاری ثبت نشده است."
                : "No achievements recorded yet."}
          </p>
        ) : (
          <div
            className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", tags.length > 0 && "mt-8")}
          >
            {visibleAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={pickLocaleField(achievement.titleFa, achievement.titleEn, appLocale)}
                competition={achievement.competition}
                year={achievement.year}
                result={achievement.result}
                photo={achievement.photo}
                scopeLabel={pickLocaleField(
                  achievement.tag.nameFa,
                  achievement.tag.nameEn,
                  appLocale,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
