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
    title: locale === "fa" ? "حریم خصوصی" : "Privacy Policy",
    alternates: buildAlternates("/privacy"),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";

  return (
    <>
      <PageHeader title={isFa ? "حریم خصوصی" : "Privacy Policy"} />
      <div className="text-text-secondary mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="reading-copy flex flex-col gap-4 leading-relaxed">
          <p>
            {isFa
              ? "پیشنام اطلاعاتی را که از طریق فرم‌های ثبت‌نام، تماس، درخواست همکاری با مدارس و درخواست‌های شغلی ارسال می‌کنید (شامل نام، شماره تماس، ایمیل و پیام شما) صرفاً برای پیگیری همان درخواست ذخیره و استفاده می‌کند."
              : "Pishnam stores information you submit through enrollment, contact, school-partnership, and job-application forms (your name, phone number, email, and message) solely to follow up on that request."}
          </p>
          <p>
            {isFa
              ? "این اطلاعات با اشخاص ثالث به اشتراک گذاشته نمی‌شود، مگر در مواردی که قانون الزام کند."
              : "This information is not shared with third parties, except where required by law."}
          </p>
          <p>
            {isFa
              ? "این سایت از تحلیل‌گر ترافیک وب self-hosted (Umami) برای درک کلی نحوه استفاده از سایت استفاده می‌کند که داده‌ای قابل شناسایی شخصی جمع‌آوری نمی‌کند."
              : "This site uses a self-hosted web analytics tool (Umami) to understand general site usage, which does not collect personally identifiable data."}
          </p>
        </div>
      </div>
    </>
  );
}
