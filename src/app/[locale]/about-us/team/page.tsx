import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
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

  const tags = await prisma.teamTag.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          members: {
            where: { member: { isVisible: true } },
          },
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        title={isFa ? "پرسنل" : "Team"}
        subtitle={isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members."}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <TeamTagNav tags={tags} appLocale={appLocale} isFa={isFa} />

        {tags.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "اطلاعات تیم به‌زودی منتشر می‌شود." : "Team info coming soon."}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => {
              const name = pickLocaleField(tag.nameFa, tag.nameEn, appLocale);
              const count = tag._count.members;
              return (
                <li key={tag.id}>
                  <Link
                    href={`/about-us/team/${tag.slug}`}
                    className="border-border bg-bg-surface hover:border-pishnam-gold-500/60 focus-visible:ring-pishnam-gold-500 block rounded-xl border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <h2 className="text-text-primary text-lg font-bold">{name}</h2>
                    <p className="text-text-secondary mt-1 text-sm">
                      {isFa ? `${count} عضو` : `${count} ${count === 1 ? "member" : "members"}`}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
