import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { Mail, Phone, MapPin } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";
import { getContactSettings } from "@/lib/contact-settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/contact-us"),
    title: locale === "fa" ? "تماس با ما" : "Contact Us",
    description:
      locale === "fa"
        ? "راه‌های ارتباط با تیم پیشنام."
        : "Ways to get in touch with the Pishnam team.",
  };
}

function toTelHref(phone: string): string {
  const latin = phone.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return `tel:${latin.replace(/[^\d+]/g, "")}`;
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";
  const settings = await getContactSettings();

  const phones = settings?.phones ?? [];
  const email = settings?.email ?? null;
  const address =
    (isFa ? settings?.addressFa : settings?.addressEn) ||
    (isFa ? settings?.addressEn : settings?.addressFa) ||
    null;
  const mapEmbedUrl = settings?.mapEmbedUrl ?? null;
  const hasDetails = phones.length > 0 || Boolean(email) || Boolean(address);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: `${siteUrl}${locale === "en" ? "/en" : ""}/contact-us`,
          mainEntity: {
            "@type": "Organization",
            name: isFa ? "پیشنام" : "Pishnam",
            ...(email ? { email } : {}),
            ...(phones.length ? { telephone: phones } : {}),
            ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
          },
        }}
      />
      <PageHeader
        title={isFa ? "تماس با ما" : "Contact Us"}
        subtitle={
          isFa
            ? "سوالی دارید؟ فرم زیر را پر کنید یا مستقیم با ما تماس بگیرید."
            : "Have a question? Fill out the form below or reach us directly."
        }
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {hasDetails ? (
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="flex flex-col gap-5 p-6">
                  {phones.length > 0 ? (
                    <div className="flex items-start gap-3">
                      <Phone
                        className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          {isFa ? "تلفن" : "Phone"}
                        </p>
                        <ul className="mt-1 flex flex-col gap-1">
                          {phones.map((phone) => (
                            <li key={phone}>
                              <a
                                href={toTelHref(phone)}
                                dir="ltr"
                                className="text-text-secondary hover:text-pishnam-gold-600 cursor-pointer text-end text-sm transition-colors duration-200 sm:text-start"
                              >
                                {phone}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}

                  {email ? (
                    <div className="flex items-start gap-3">
                      <Mail
                        className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          {isFa ? "ایمیل" : "Email"}
                        </p>
                        <a
                          href={`mailto:${email}`}
                          dir="ltr"
                          className="text-text-secondary hover:text-pishnam-gold-600 mt-1 block cursor-pointer text-end text-sm transition-colors duration-200 sm:text-start"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {address ? (
                    <div className="flex items-start gap-3">
                      <MapPin
                        className="text-pishnam-steel-600 mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          {isFa ? "آدرس" : "Address"}
                        </p>
                        <p className="text-text-secondary mt-1 text-sm whitespace-pre-line">
                          {address}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : null}

          <div className={hasDetails ? "lg:col-span-3" : "lg:col-span-5"}>
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

        {mapEmbedUrl ? (
          <div className="border-border mt-8 overflow-hidden rounded-xl border">
            <iframe
              src={mapEmbedUrl}
              title={isFa ? "موقعیت روی نقشه" : "Location on map"}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-72 w-full border-0 sm:h-96"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
