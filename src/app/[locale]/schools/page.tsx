import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { School, Users2, Trophy } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/schools"),
    title: locale === "fa" ? "مدارس و همکاری‌ها" : "Schools & Partnerships",
    description:
      locale === "fa"
        ? "برگزاری دوره‌های رباتیک در مدرسه شما با تیم پیشنام."
        : "Bring robotics programs into your school with the Pishnam team.",
  };
}

export default async function SchoolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";

  const pitchPoints = [
    {
      icon: School,
      title: isFa ? "برنامه درسی آماده" : "Ready-made curriculum",
      body: isFa
        ? "دوره‌های پیشرونده متناسب با هر مقطع تحصیلی، آماده اجرا در فضای مدرسه شما."
        : "Progressive, tier-appropriate courses ready to run inside your school.",
    },
    {
      icon: Users2,
      title: isFa ? "مربیان مجرب" : "Experienced instructors",
      body: isFa
        ? "تیمی با سابقه اجرای برنامه‌های آموزشی مشترک و راهنمایی مسابقات رباتیک."
        : "A team with a track record of running shared curricula and coaching competition teams.",
    },
    {
      icon: Trophy,
      title: isFa ? "مسیر تا مسابقات" : "A path to competition",
      body: isFa
        ? "دانش‌آموزان علاقه‌مند می‌توانند مسیر خود را تا تیم‌های مسابقات روبوکاپ ادامه دهند."
        : "Interested students can continue on to RoboCup competition teams.",
    },
  ];

  return (
    <>
      <PageHeader
        title={isFa ? "مدارس و همکاری‌ها" : "Schools & Partnerships"}
        subtitle={
          isFa
            ? "رباتیک، الکترونیک و هوش مصنوعی را به برنامه درسی مدرسه خود اضافه کنید."
            : "Bring robotics, electronics, and AI into your school's curriculum."
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {pitchPoints.map((point) => (
            <Card key={point.title}>
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="bg-pishnam-steel-600/15 text-pishnam-steel-600 flex size-11 items-center justify-center rounded-lg">
                  <point.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-text-primary font-bold">{point.title}</h3>
                <p className="text-text-secondary text-sm">{point.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-bg-surface-alt py-14">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-text-primary text-xl font-bold">
            {isFa ? "درخواست همکاری" : "Request a partnership"}
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            {isFa
              ? "اطلاعات مدرسه خود را وارد کنید تا همکاران ما برای بررسی امکان همکاری با شما تماس بگیرند."
              : "Tell us about your school and our team will reach out to discuss a partnership."}
          </p>
          <div className="mt-6">
            <LeadCaptureForm
              leadType="SCHOOL"
              analyticsEvent="school_inquiry_submit"
              submitLabel={isFa ? "ارسال درخواست" : "Send inquiry"}
              extraFields={[
                { name: "schoolName", label: isFa ? "نام مدرسه" : "School name", required: true },
                { name: "city", label: isFa ? "شهر" : "City" },
              ]}
              successTitle={isFa ? "درخواست شما ثبت شد" : "Inquiry received"}
              successBody={
                isFa
                  ? "همکاران ما به‌زودی برای هماهنگی جلسه معرفی با شما تماس می‌گیرند."
                  : "Our team will contact you soon to set up an introductory call."
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
