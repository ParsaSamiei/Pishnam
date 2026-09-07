import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { TeamPageContent } from "@/components/team/team-member-grid";
import { TeamTagNav } from "@/components/team/team-tag-nav";
import { buildAlternates } from "@/lib/i18n/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fa" ? "پرسنل" : "Team",
    alternates: buildAlternates("/about-us/team"),
  };
}

export default async function TeamHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const [tags, alumniMembers] = await Promise.all([
    prisma.teamTag.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        members: {
          where: { member: { isVisible: true, isAlumni: false } },
          orderBy: { member: { order: "asc" } },
          include: { member: true },
        },
      },
    }),
    prisma.teamMember.findMany({
      where: { isVisible: true, isAlumni: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const tagSections = tags
    .map((tag) => ({
      slug: tag.slug,
      nameFa: tag.nameFa,
      nameEn: tag.nameEn,
      members: tag.members.map((row) => row.member),
    }))
    .filter((tag) => tag.members.length > 0);

  return (
    <>
      <PageHeader
        title={isFa ? "پرسنل" : "Team"}
        subtitle={isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members."}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <TeamTagNav tags={tagSections} appLocale={appLocale} isFa={isFa} />
        <TeamPageContent
          tags={tagSections}
          alumni={alumniMembers}
          appLocale={appLocale}
          isFa={isFa}
        />
      </div>
    </>
  );
}
