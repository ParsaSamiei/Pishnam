import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { TeamMemberSections } from "@/components/team/team-member-grid";
import { TeamTagNav } from "@/components/team/team-tag-nav";
import { buildAlternates } from "@/lib/i18n/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = await prisma.teamTag.findFirst({
    where: { slug, active: true },
    select: { nameFa: true, nameEn: true },
  });

  if (!tag) {
    return { title: locale === "fa" ? "پرسنل" : "Team" };
  }

  const title = locale === "fa" ? tag.nameFa : tag.nameEn;
  return {
    title,
    alternates: buildAlternates(`/about-us/team/${slug}`),
  };
}

export default async function TeamTagPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const [tag, allTags] = await Promise.all([
    prisma.teamTag.findFirst({
      where: { slug, active: true },
      include: {
        members: {
          where: { member: { isVisible: true } },
          orderBy: { member: { order: "asc" } },
          include: { member: true },
        },
      },
    }),
    prisma.teamTag.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { slug: true, nameFa: true, nameEn: true },
    }),
  ]);

  if (!tag) {
    notFound();
  }

  const title = pickLocaleField(tag.nameFa, tag.nameEn, appLocale);
  const members = tag.members.map((row) => row.member);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members."}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <TeamTagNav tags={allTags} appLocale={appLocale} isFa={isFa} activeSlug={tag.slug} />
        <TeamMemberSections members={members} appLocale={appLocale} isFa={isFa} />
      </div>
    </>
  );
}
