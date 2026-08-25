import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/feedback"),
    title: locale === "fa" ? "انتقادات و پیشنهادات" : "Feedback & Suggestions",
    description:
      locale === "fa"
        ? "نظر، انتقاد یا پیشنهاد خود را برای تیم پیشنام ارسال کنید."
        : "Share a comment, criticism, or suggestion with the Pishnam team.",
  };
}

export default async function FeedbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";

  return (
    <>
      <PageHeader
        title={isFa ? "انتقادات و پیشنهادات" : "Feedback & Suggestions"}
        subtitle={
          isFa
            ? "نظر، انتقاد یا پیشنهادتان را بنویسید. نوشتن نام اختیاری است."
            : "Share a comment, criticism, or suggestion. Your name is optional."
        }
      />
      <div className="mx-auto max-w-2xl min-w-0 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="min-w-0">
          <CardContent className="min-w-0 p-6 sm:p-8">
            <FeedbackForm
              nameLabel={isFa ? "نام" : "Name"}
              nameHint={
                isFa
                  ? "اختیاری — می‌توانید ناشناس بفرستید."
                  : "Optional — you can submit anonymously."
              }
              messageLabel={isFa ? "متن انتقاد یا پیشنهاد *" : "Your feedback *"}
              messageHint={
                isFa
                  ? "هر چه می‌خواهید بنویسید — آزادانه نظر، انتقاد یا پیشنهادتان را بگویید."
                  : "Write freely — a comment, criticism, or suggestion."
              }
              submitLabel={isFa ? "ارسال" : "Submit"}
              successTitle={isFa ? "با تشکر از پیام شما" : "Thank you for your message"}
              successBody={
                isFa
                  ? "انتقاد یا پیشنهادتان ثبت شد و توسط تیم پیشنام خوانده می‌شود."
                  : "Your feedback has been received and will be read by the Pishnam team."
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
