import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { PublicFeedbackWall } from "@/components/feedback/public-feedback-wall";
import { Card, CardContent } from "@/components/ui/card";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveVoterKey } from "@/lib/feedback-voter";
import { getClientIp } from "@/lib/rate-limit";
import type { AppLocale } from "@/lib/i18n/routing";

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
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const isFa = locale === "fa";

  const approved = await prisma.feedback.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      message: true,
      likeCount: true,
      dislikeCount: true,
      createdAt: true,
    },
  });

  const voterKey = resolveVoterKey(getClientIp(await headers()));
  const myVotes =
    approved.length > 0
      ? await prisma.feedbackVote.findMany({
          where: {
            voterKey,
            feedbackId: { in: approved.map((item) => item.id) },
          },
          select: { feedbackId: true, value: true },
        })
      : [];

  const myVoteById = new Map(myVotes.map((vote) => [vote.feedbackId, vote.value]));

  const items = approved.map((item) => ({
    ...item,
    myVote: myVoteById.get(item.id) ?? null,
  }));

  return (
    <>
      <PageHeader
        title={isFa ? "انتقادات و پیشنهادات" : "Feedback & Suggestions"}
        subtitle={
          isFa
            ? "نظر، انتقاد یا پیشنهادتان را بنویسید. نوشتن نام اختیاری است. پیام‌های تأییدشدهٔ تیم در همین صفحه نمایش داده می‌شوند."
            : "Share a comment, criticism, or suggestion. Your name is optional. Messages approved by the team appear on this page."
        }
      />

      {/* Form first: primary job of this page is submitting feedback. */}
      <div className="mx-auto max-w-2xl min-w-0 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="min-w-0">
          <CardContent className="min-w-0 p-6 sm:p-8">
            <FeedbackForm
              nameLabel={isFa ? "نام و نام خانوادگی" : "Name and Surname"}
              nameHint={
                isFa
                  ? "اختیاری — می‌توانید نام و نام خانوادگی خود را بنویسید."
                  : "Optional — you can submit your name and surname."
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

      {/* Public wall: same message text on FA/EN; chrome is localized. */}
      <PublicFeedbackWall
        locale={locale}
        items={items}
        title={isFa ? "پیام‌های جامعه پیشنام" : "Pishnam Community Feedback"}
        subtitle={
          isFa
            ? "نظرات منتشرشده توسط جامعه پیشنام. می‌توانید موافق یا مخالف باشید — هر پیام یک رأی."
            : "Messages published by the Pishnam community. You can like or dislike — one vote per message."
        }
        empty={
          isFa
            ? "هنوز پیام جامعه پیشنامی برای نمایش وجود ندارد."
            : "No community feedback to show yet."
        }
        anonymousLabel={isFa ? "ناشناس" : "Anonymous"}
        voteLabels={{
          like: isFa ? "موافق" : "Like",
          dislike: isFa ? "مخالف" : "Dislike",
          likeCount: isFa ? "تعداد موافق" : "Likes",
          dislikeCount: isFa ? "تعداد مخالف" : "Dislikes",
          error: isFa
            ? "ثبت رأی ممکن نشد. لطفاً دوباره تلاش کنید."
            : "Could not save your vote. Please try again.",
        }}
      />
    </>
  );
}
