import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { Mail, Phone, MapPin } from "lucide-react";
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
    alternates: buildAlternates("/contact"),
    title: locale === "fa" ? "تماس با ما" : "Contact",
    description:
      locale === "fa"
        ? "راه‌های ارتباط با تیم پیشنام."
        : "Ways to get in touch with the Pishnam team.",
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";

  return (
    <>
      <PageHeader
        title={isFa ? "تماس با ما" : "Contact Us"}
        subtitle={
          isFa
            ? "سوالی دارید؟ فرم زیر را پر کنید یا مستقیم با ما تماس بگیرید."
            : "Have a question? Fill out the form below or reach us directly."
        }
      />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex items-start gap-3">
                <Phone
                  className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {isFa ? "تلفن" : "Phone"}
                  </p>
                  <p dir="ltr" className="text-text-secondary text-end text-sm sm:text-start">
                    +98 21 0000 0000
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail
                  className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {isFa ? "ایمیل" : "Email"}
                  </p>
                  <p dir="ltr" className="text-text-secondary text-end text-sm sm:text-start">
                    info@pishnam.example
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin
                  className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {isFa ? "آدرس" : "Address"}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {isFa ? "تهران، ایران" : "Tehran, Iran"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <LeadCaptureForm
            leadType="GENERAL_CONTACT"
            analyticsEvent="contact_form_submit"
            submitLabel={isFa ? "ارسال پیام" : "Send message"}
            successTitle={isFa ? "پیام شما ارسال شد" : "Your message has been sent"}
            successBody={
              isFa
                ? "در اسرع وقت با شما تماس می‌گیریم."
                : "We'll get back to you as soon as possible."
            }
            messageLabel={isFa ? "پیام *" : "Message *"}
          />
        </div>
      </div>
    </>
  );
}
