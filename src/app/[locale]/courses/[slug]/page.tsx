import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { TIER_LABELS, type TierValue } from "@/lib/tier-labels";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/rich-text";
import { AchievementCard } from "@/components/home/achievement-card";
import { JsonLd } from "@/components/json-ld";

async function getCourse(slug: string, locale: AppLocale) {
  return prisma.course.findUnique({
    where: { slug, active: true },
    include: {
      translations: { where: { locale } },
      achievements: { orderBy: { year: "desc" }, take: 4 },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getCourse(slug, locale as AppLocale);
  const translation = course?.translations[0];

  if (!translation) return {};

  return {
    alternates: buildAlternates(`/courses/${slug}`),
    title: translation.title,
    description: translation.excerpt,
    openGraph: {
      type: "website",
      title: translation.title,
      description: translation.excerpt,
      images: course?.coverImage ? [{ url: course.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: translation.title,
      description: translation.excerpt,
      images: course?.coverImage ? [course.coverImage] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const course = await getCourse(slug, appLocale);
  const translation = course?.translations[0];

  if (!course || !translation) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: translation.title,
          description: translation.excerpt,
          provider: { "@type": "Organization", name: "Pishnam" },
        }}
      />

      <div className="bg-pishnam-navy-900 relative h-64 w-full sm:h-80">
        {course.coverImage && (
          <Image
            src={course.coverImage}
            alt=""
            fill
            className="object-cover opacity-70"
            sizes="100vw"
            priority
          />
        )}
        <div className="from-pishnam-navy-900 via-pishnam-navy-900/40 absolute inset-0 flex items-end bg-gradient-to-t to-transparent">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <span className="bg-pishnam-gold-500 text-pishnam-navy-900 inline-block rounded-full px-3 py-1 text-xs font-bold">
              {TIER_LABELS[appLocale][course.tier as TierValue]}
            </span>
            <h1 className="text-pishnam-off-white mt-3 text-2xl font-extrabold sm:text-3xl">
              {translation.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <RichText html={translation.body} />

          {translation.prerequisites && (
            <div className="border-border bg-bg-surface-alt mt-6 rounded-lg border p-4">
              <h2 className="text-text-primary text-sm font-bold">
                {isFa ? "پیش‌نیازها" : "Prerequisites"}
              </h2>
              <p className="text-text-secondary mt-1 text-sm">{translation.prerequisites}</p>
            </div>
          )}

          {course.achievements.length > 0 && (
            <div className="mt-10">
              <h2 className="text-text-primary text-lg font-bold">
                {isFa ? "افتخارات مرتبط" : "Related achievements"}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {course.achievements.map((achievement) => (
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
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="border-border bg-bg-surface sticky top-24 rounded-xl border p-5">
            <h2 className="text-text-primary font-bold">
              {isFa ? "علاقه‌مند به این دوره‌اید؟" : "Interested in this course?"}
            </h2>
            <p className="text-text-secondary mt-1.5 text-sm">
              {isFa
                ? "همین حالا فرم ثبت‌نام را پر کنید تا همکاران ما با شما تماس بگیرند."
                : "Fill out the enrollment form and our team will reach out."}
            </p>
            <Button asChild size="lg" className="mt-4 w-full">
              <Link
                href={{ pathname: "/enroll", query: { course: course.slug, tier: course.tier } }}
              >
                {isFa ? "ثبت‌نام در این دوره" : "Enroll in this course"}
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
