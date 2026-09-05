import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { Briefcase } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { LeadCaptureForm, type LeadExtraField } from "@/components/forms/lead-capture-form";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/careers"),
    title: locale === "fa" ? "فرصت‌های شغلی و کارآموزی" : "Careers & Internships",
    description:
      locale === "fa"
        ? "فرصت‌های شغلی و کارآموزی فعال در پیشنام."
        : "Open positions and internships at Pishnam.",
  };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const jobs = await prisma.jobPosting.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });

  const positionField: LeadExtraField =
    jobs.length > 0
      ? {
          name: "position",
          label: isFa ? "موقعیت شغلی مورد نظر" : "Position of interest",
          type: "select",
          options: [
            { value: "", label: isFa ? "عمومی / مشخص نیست" : "General / not sure" },
            ...jobs.map((job) => ({
              value: job.titleFa,
              label: pickLocaleField(job.titleFa, job.titleEn, appLocale),
            })),
          ],
        }
      : { name: "position", label: isFa ? "موقعیت شغلی مورد نظر" : "Position of interest" };

  return (
    <>
      <PageHeader
        title={isFa ? "فرصت‌های شغلی و کارآموزی" : "Careers & Internships"}
        subtitle={
          isFa
            ? "به تیمی بپیوندید که رباتیک و الکترونیک را به نسل بعدی آموزش می‌دهد."
            : "Join a team teaching robotics and electronics to the next generation."
        }
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {jobs.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa
              ? "در حال حاضر فرصت شغلی فعالی وجود ندارد. برای ثبت رزومه عمومی از فرم پایین صفحه استفاده کنید."
              : "There are no open positions right now. Use the form below to send a general application."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <Card key={job.id} id={`job-${job.id}`} className="scroll-mt-24">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Briefcase
                      className="text-pishnam-steel-600 mt-1 size-5 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-text-primary font-bold">
                        {pickLocaleField(job.titleFa, job.titleEn, appLocale)}
                      </h3>
                      <p className="reading-copy text-text-secondary mt-1.5 text-sm whitespace-pre-line">
                        {pickLocaleField(job.descriptionFa, job.descriptionEn, appLocale)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="bg-bg-surface-alt py-14">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-text-primary text-xl font-bold">
            {isFa ? "ارسال درخواست" : "Submit an application"}
          </h2>
          <div className="mt-6">
            <LeadCaptureForm
              leadType="JOB_APPLICATION"
              analyticsEvent="job_application_submit"
              submitLabel={isFa ? "ارسال درخواست" : "Submit application"}
              extraFields={[positionField]}
              successTitle={isFa ? "درخواست شما ثبت شد" : "Application received"}
              successBody={
                isFa
                  ? "رزومه و درخواست شما بررسی می‌شود و در صورت تناسب با شما تماس می‌گیریم."
                  : "We'll review your application and reach out if it's a fit."
              }
              messageLabel={isFa ? "درباره خودتان بگویید" : "Tell us about yourself"}
              messagePlaceholder={
                isFa
                  ? "سوابق، مهارت‌ها، لینک نمونه‌کار یا رزومه..."
                  : "Experience, skills, portfolio or resume link..."
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
