import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { TIER_LABELS } from "@/lib/tier-labels";
import { PageHeader } from "@/components/layout/page-header";
import { ClassSessionGrid } from "@/components/classes/class-session-grid";
import { EnrollmentApplication } from "@/components/forms/enrollment-application";
import { LeadCaptureForm, type LeadExtraField } from "@/components/forms/lead-capture-form";
import {
  getEnrollmentGuidelines,
  isEnrollmentGuidelinesGateActive,
} from "@/lib/enrollment-guidelines";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/enroll"),
    title: locale === "fa" ? "ثبت‌نام" : "Enroll",
    description:
      locale === "fa"
        ? "فرم ثبت‌نام دوره‌های رباتیک، الکترونیک و هوش مصنوعی پیشنام."
        : "Enrollment form for Pishnam's robotics, electronics, and AI courses.",
  };
}

export default async function EnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ course?: string; tier?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";
  const { course: courseSlug, tier } = await searchParams;

  const [courses, sessions] = await Promise.all([
    prisma.course.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { translations: { where: { locale: appLocale } } },
    }),
    prisma.classSession.findMany({
      where: { active: true },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      include: { course: { include: { translations: { where: { locale: appLocale } } } } },
    }),
  ]);

  const sessionCards = sessions.map((session) => ({
    id: session.id,
    weekday: session.weekday,
    startTime: session.startTime,
    endTime: session.endTime,
    location: session.location,
    capacityNote: session.capacityNote,
    courseTitle: session.course.translations[0]?.title ?? null,
    coverImage: session.course.coverImage,
  }));

  const guidelines = await getEnrollmentGuidelines();
  const showGuidelines = isEnrollmentGuidelinesGateActive(guidelines, appLocale);

  const extraFields: LeadExtraField[] = [
    {
      name: "courseSlug",
      label: isFa ? "دوره مورد نظر" : "Course of interest",
      type: "select",
      defaultValue: courseSlug ?? "",
      options: [
        {
          value: "",
          label: isFa ? "مشخص نیست / راهنمایی می‌خواهم" : "Not sure / need guidance",
        },
        ...courses.map((course) => ({
          value: course.slug,
          label: course.translations[0]?.title ?? course.slug,
        })),
      ],
    },
    {
      name: "tier",
      label: isFa ? "مقطع تحصیلی" : "Grade level",
      type: "select",
      defaultValue: tier ?? "",
      options: [
        { value: "", label: isFa ? "مشخص نیست" : "Not sure" },
        ...Object.entries(TIER_LABELS[appLocale]).map(([value, label]) => ({ value, label })),
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title={isFa ? "ثبت‌نام" : "Enroll"}
        subtitle={
          isFa
            ? "فرم زیر را پر کنید تا همکاران ما برای هماهنگی ثبت‌نام با شما تماس بگیرند."
            : "Fill out the form below and our team will reach out to complete your enrollment."
        }
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-text-primary mb-6 text-xl font-bold">
          {isFa ? "کلاس‌های حضوری" : "In-Person Classes"}
        </h2>
        <ClassSessionGrid
          sessions={sessionCards}
          locale={appLocale}
          emptyMessage={
            isFa
              ? "برنامه کلاس‌ها به‌زودی اعلام می‌شود."
              : "The class schedule will be announced soon."
          }
        />
      </section>

      <section className="bg-bg-surface-alt py-14">
        <div
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${showGuidelines ? "max-w-3xl" : "max-w-xl"}`}
        >
          <h2 className="text-text-primary mb-6 text-xl font-bold">
            {isFa ? "فرم ثبت‌نام" : "Enrollment form"}
          </h2>
          {showGuidelines && guidelines ? (
            <EnrollmentApplication
              locale={appLocale}
              guidelines={guidelines}
              leadType="ENROLL"
              analyticsEvent="enroll_form_submit"
              submitLabel={isFa ? "ارسال درخواست ثبت‌نام" : "Submit enrollment request"}
              extraFields={extraFields}
              successTitle={isFa ? "درخواست شما ثبت شد" : "Your request has been received"}
              successBody={
                isFa
                  ? "همکاران ما به‌زودی برای هماهنگی جزئیات ثبت‌نام با شما تماس می‌گیرند."
                  : "Our team will contact you soon to finalize enrollment details."
              }
              messageLabel={isFa ? "توضیحات تکمیلی (اختیاری)" : "Additional notes (optional)"}
            />
          ) : (
            <LeadCaptureForm
              leadType="ENROLL"
              analyticsEvent="enroll_form_submit"
              submitLabel={isFa ? "ارسال درخواست ثبت‌نام" : "Submit enrollment request"}
              extraFields={extraFields}
              successTitle={isFa ? "درخواست شما ثبت شد" : "Your request has been received"}
              successBody={
                isFa
                  ? "همکاران ما به‌زودی برای هماهنگی جزئیات ثبت‌نام با شما تماس می‌گیرند."
                  : "Our team will contact you soon to finalize enrollment details."
              }
              messageLabel={isFa ? "توضیحات تکمیلی (اختیاری)" : "Additional notes (optional)"}
            />
          )}
        </div>
      </section>
    </>
  );
}
