import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Trophy, Users, HelpCircle } from "lucide-react";
import { buildAlternates } from "@/lib/i18n/alternates";
import { PageHeader } from "@/components/layout/page-header";
import { AudienceEntryCard } from "@/components/home/audience-entry-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/about-us"),
    title: locale === "fa" ? "درباره پیشنام" : "About Pishnam",
    description:
      locale === "fa"
        ? "تاریخچه، ماموریت و تیم پژوهشگران رباتیک پیشنام."
        : "The history, mission, and team behind Pishnam Robotics Researchers.",
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === "fa";
  const tCommon = await getTranslations("common");
  const learnMore = tCommon("learnMore");

  const links = [
    {
      href: "/about-us/achievements" as const,
      icon: Trophy,
      title: isFa ? "افتخارات و جوایز" : "Achievements & Awards",
      body: isFa
        ? "نتایج تیم پیشنام در مسابقات ملی و بین‌المللی."
        : "Pishnam's results at national and international competitions.",
      accent: "gold" as const,
    },
    {
      href: "/about-us/team" as const,
      icon: Users,
      title: isFa ? "پرسنل" : "Team",
      body: isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members.",
      accent: "steel" as const,
    },
    {
      href: "/about-us/faq" as const,
      icon: HelpCircle,
      title: isFa ? "سوالات متداول" : "FAQ",
      body: isFa
        ? "پاسخ به پرسش‌های رایج درباره دوره‌ها و ثبت‌نام."
        : "Answers to common questions about courses and enrollment.",
      accent: "gold" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title={isFa ? "درباره پیشنام" : "About Pishnam"}
        subtitle={
          isFa
            ? "پژوهشگران رباتیک پیشنام، آموزش پیشرونده رباتیک، الکترونیک و هوش مصنوعی را از دبستان تا مسابقات بین‌المللی روبوکاپ ارائه می‌دهد."
            : "Pishnam Robotics Researchers offers progressive robotics, electronics, and AI education, from elementary school through international RoboCup competitions."
        }
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="reading-copy text-text-secondary leading-relaxed">
          {isFa
            ? "پیشنام با هدف آموزش عملی و پروژه‌محور رباتیک و الکترونیک به دانش‌آموزان تاسیس شد. مسیر آموزشی ما از مفاهیم پایه مدار و برنامه‌نویسی شروع می‌شود و دانش‌آموزان علاقه‌مند را تا سطح تیم‌های مسابقات روبوکاپ همراهی می‌کند."
            : "Pishnam was founded to teach robotics and electronics through hands-on, project-based learning. Our path starts with basic circuits and programming concepts and carries interested students all the way to RoboCup competition teams."}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {links.map((link) => (
            <AudienceEntryCard
              key={link.href}
              href={link.href}
              icon={link.icon}
              title={link.title}
              description={link.body}
              cta={learnMore}
              accent={link.accent}
            />
          ))}
        </div>
      </section>
    </>
  );
}
