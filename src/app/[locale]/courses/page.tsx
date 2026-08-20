import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { TIERS, TIER_LABELS, type TierValue } from "@/lib/tier-labels";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CourseCard } from "@/components/courses/course-card";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/courses"),
    title: locale === "fa" ? "دوره‌ها و سطوح" : "Courses & Tiers",
    description:
      locale === "fa"
        ? "دوره‌های پیشرونده رباتیک، الکترونیک و هوش مصنوعی پیشنام، از دبستان تا مسابقات."
        : "Pishnam's progressive robotics, electronics, and AI courses, from elementary school to competition.",
  };
}

function isTierValue(value: string | undefined): value is TierValue {
  return Boolean(value) && (TIERS as readonly string[]).includes(value as string);
}

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const { tier: tierParam } = await searchParams;
  const activeTier = isTierValue(tierParam) ? tierParam : undefined;

  const courses = await prisma.course.findMany({
    where: { active: true, ...(activeTier ? { tier: activeTier } : {}) },
    orderBy: { order: "asc" },
    include: { translations: { where: { locale: appLocale } } },
  });

  return (
    <>
      <PageHeader
        title={isFa ? "دوره‌ها و سطوح" : "Courses & Tiers"}
        subtitle={
          isFa
            ? "از اولین مدار الکترونیکی تا رباتی آماده مسابقه — مسیر متناسب با مقطع تحصیلی خود را پیدا کنید."
            : "From your first circuit to a competition-ready robot — find the path that fits your grade level."
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={isFa ? "فیلتر بر اساس مقطع" : "Filter by tier"}
        >
          <Link
            href="/courses"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !activeTier
                ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                : "border-border text-text-secondary hover:bg-bg-surface-alt",
            )}
          >
            {isFa ? "همه دوره‌ها" : "All courses"}
          </Link>
          {TIERS.map((tierValue) => (
            <Link
              key={tierValue}
              href={{ pathname: "/courses", query: { tier: tierValue } }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeTier === tierValue
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500 text-pishnam-navy-900"
                  : "border-border text-text-secondary hover:bg-bg-surface-alt",
              )}
            >
              {TIER_LABELS[appLocale][tierValue]}
            </Link>
          ))}
        </div>

        {courses.length === 0 ? (
          <p className="text-text-secondary mt-10 text-center">
            {isFa ? "دوره‌ای در این مقطع یافت نشد." : "No courses found for this tier."}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const translation = course.translations[0];
              if (!translation) return null;
              return (
                <CourseCard
                  key={course.id}
                  slug={course.slug}
                  title={translation.title}
                  excerpt={translation.excerpt}
                  coverImage={course.coverImage}
                  tierLabel={TIER_LABELS[appLocale][course.tier as TierValue]}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
