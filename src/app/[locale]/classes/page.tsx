import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { Clock, MapPin } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatWeekday } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";
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
    alternates: buildAlternates("/classes"),
    title: locale === "fa" ? "کلاس‌های حضوری" : "In-Person Classes",
    description:
      locale === "fa"
        ? "برنامه هفتگی کلاس‌های حضوری رباتیک و الکترونیک پیشنام."
        : "Pishnam's weekly in-person robotics and electronics class schedule.",
  };
}

export default async function ClassesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const sessions = await prisma.classSession.findMany({
    where: { active: true },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    include: { course: { include: { translations: { where: { locale: appLocale } } } } },
  });

  return (
    <>
      <PageHeader
        title={isFa ? "کلاس‌های حضوری" : "In-Person Classes"}
        subtitle={
          isFa
            ? "برنامه هفتگی کلاس‌ها را ببینید و در صورت وجود جای خالی، درخواست ثبت‌نام دهید."
            : "Browse the weekly schedule and request a seat if one is open."
        }
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {sessions.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa
              ? "برنامه کلاس‌ها به‌زودی اعلام می‌شود."
              : "The class schedule will be announced soon."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-5">
                  <p className="text-pishnam-steel-600 text-xs font-semibold tracking-wide uppercase">
                    {session.course.translations[0]?.title}
                  </p>
                  <p className="text-text-primary mt-1 font-bold">
                    {formatWeekday(session.weekday, appLocale)}
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
        )}
      </section>

      {sessions.length > 0 && (
        <section className="bg-bg-surface-alt py-14">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-text-primary text-xl font-bold">
              {isFa ? "درخواست جای خالی" : "Request a seat"}
            </h2>
            <div className="mt-6">
              <LeadCaptureForm
                leadType="CLASS_SEAT"
                analyticsEvent="class_seat_request"
                submitLabel={isFa ? "ارسال درخواست" : "Request a seat"}
                extraFields={[
                  {
                    name: "classSession",
                    label: isFa ? "کلاس مورد نظر" : "Class",
                    type: "select",
                    required: true,
                    options: sessions.map((session) => ({
                      value: session.id,
                      label: `${session.course.translations[0]?.title} — ${formatWeekday(session.weekday, appLocale)} ${session.startTime}`,
                    })),
                  },
                ]}
                successTitle={isFa ? "درخواست شما ثبت شد" : "Request received"}
                successBody={
                  isFa
                    ? "در صورت وجود جای خالی، همکاران ما با شما تماس می‌گیرند."
                    : "If a seat is available, our team will contact you."
                }
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
