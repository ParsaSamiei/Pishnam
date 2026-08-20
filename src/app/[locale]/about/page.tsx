import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { Trophy, Users, HelpCircle } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/about"),
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

  const links = [
    {
      href: "/about/achievements" as const,
      icon: Trophy,
      title: isFa ? "افتخارات و جوایز" : "Achievements & Awards",
      body: isFa
        ? "نتایج تیم پیشنام در مسابقات ملی و بین‌المللی."
        : "Pishnam's results at national and international competitions.",
    },
    {
      href: "/about/team" as const,
      icon: Users,
      title: isFa ? "پرسنل" : "Team",
      body: isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members.",
    },
    {
      href: "/about/faq" as const,
      icon: HelpCircle,
      title: isFa ? "سوالات متداول" : "FAQ",
      body: isFa
        ? "پاسخ به پرسش‌های رایج درباره دوره‌ها و ثبت‌نام."
        : "Answers to common questions about courses and enrollment.",
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
        <p className="text-text-secondary leading-relaxed">
          {isFa
            ? "پیشنام با هدف آموزش عملی و پروژه‌محور رباتیک و الکترونیک به دانش‌آموزان تاسیس شد. مسیر آموزشی ما از مفاهیم پایه مدار و برنامه‌نویسی شروع می‌شود و دانش‌آموزان علاقه‌مند را تا سطح تیم‌های مسابقات روبوکاپ همراهی می‌کند."
            : "Pishnam was founded to teach robotics and electronics through hands-on, project-based learning. Our path starts with basic circuits and programming concepts and carries interested students all the way to RoboCup competition teams."}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="bg-pishnam-gold-500/15 text-pishnam-gold-600 flex size-11 items-center justify-center rounded-lg">
                    <link.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-text-primary font-bold">{link.title}</h2>
                  <p className="text-text-secondary text-sm">{link.body}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
