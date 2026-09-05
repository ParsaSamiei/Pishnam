import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { ACHIEVEMENT_SCOPE_LABELS } from "@/lib/achievement-scope";
import { PageHeader } from "@/components/layout/page-header";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { AchievementCard } from "@/components/home/achievement-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/sponsors"),
    title: locale === "fa" ? "حامیان و اسپانسرها" : "Sponsors",
    description:
      locale === "fa"
        ? "افتخارات تیم پیشنام و فرصت‌های حمایت مالی از آموزش رباتیک."
        : "Pishnam's competition achievements and robotics education sponsorship opportunities.",
  };
}

export default async function SponsorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const achievements = await prisma.achievement.findMany({
    orderBy: { year: "desc" },
    take: 8,
  });

  return (
    <>
      <PageHeader
        title={isFa ? "حامیان و اسپانسرها" : "Sponsors"}
        subtitle={
          isFa
            ? "دانش‌آموزان پیشنام با حمایت شما به مسابقات ملی و بین‌المللی راه پیدا می‌کنند."
            : "With your support, Pishnam students compete at national and international events."
        }
      />

      {achievements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-text-primary text-xl font-bold">
            {isFa ? "افتخارات اخیر" : "Recent achievements"}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>
      )}

      <section className="bg-bg-surface-alt py-14">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-text-primary text-xl font-bold">
            {isFa ? "حامی پیشنام شوید" : "Become a sponsor"}
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            {isFa
              ? "فرم زیر را پر کنید تا اطلاعات بیشتری درباره سطوح حمایت و مزایای آن در اختیارتان قرار دهیم."
              : "Fill out the form below and we'll share sponsorship tiers and benefits with you."}
          </p>
          <div className="mt-6">
            <LeadCaptureForm
              leadType="SPONSOR"
              analyticsEvent="sponsor_inquiry_submit"
              submitLabel={isFa ? "ارسال درخواست" : "Send inquiry"}
              extraFields={[
                {
                  name: "organization",
                  label: isFa ? "نام سازمان / شرکت" : "Organization / company name",
                },
              ]}
              successTitle={isFa ? "درخواست شما ثبت شد" : "Inquiry received"}
              successBody={
                isFa
                  ? "همکاران ما به‌زودی اطلاعات حمایت مالی را برای شما ارسال می‌کنند."
                  : "Our team will send you sponsorship details soon."
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
