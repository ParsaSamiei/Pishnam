import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/i18n/alternates";
import { PageHeader } from "@/components/layout/page-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "قوانین و مقررات" : "Terms of Service",
    alternates: buildAlternates("/terms"),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";

  return (
    <>
      <PageHeader title={isFa ? "قوانین و مقررات" : "Terms of Service"} />
      <div className="text-text-secondary mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="reading-copy flex flex-col gap-4 leading-relaxed">
          <p>
            {isFa
              ? "استفاده از محتوای دانلودی این سایت (نرم‌افزار، دیتاشیت، کتاب، پوستر و کتابخانه قطعات) رایگان و صرفاً برای مقاصد آموزشی و پژوهشی است."
              : "Downloadable content on this site (software, datasheets, books, posters, and part libraries) is free and intended for educational and research purposes."}
          </p>
          <p>
            {isFa
              ? "ثبت‌نام قطعی در دوره‌ها منوط به هماهنگی نهایی با تیم پیشنام پس از ارسال فرم ثبت‌نام است."
              : "Final course enrollment is subject to confirmation with the Pishnam team after submitting the enrollment form."}
          </p>
        </div>
      </div>
    </>
  );
}
