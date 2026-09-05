import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { TeamMemberCard } from "@/components/team/team-member-card";
import { buildAlternates } from "@/lib/i18n/alternates";
import { formatCollaborationStartLabel } from "@/lib/format";

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

function TeamMemberGrid({
  members,
  appLocale,
  isFa,
}: {
  members: Awaited<ReturnType<typeof prisma.teamMember.findMany>>;
  appLocale: AppLocale;
  isFa: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => {
        const name = pickLocaleField(member.nameFa, member.nameEn, appLocale);
        const role = pickLocaleField(member.roleFa, member.roleEn, appLocale);
        const bio = pickLocaleField(member.bioFa, member.bioEn, appLocale);
        const collaborationStartLabel = member.collaborationStartDate
          ? formatCollaborationStartLabel(member.collaborationStartDate, appLocale)
          : null;

        return (
          <TeamMemberCard
            key={member.id}
            name={name}
            role={role}
            photo={member.photo}
            bio={bio}
            resume={member.resume}
            collaborationStartLabel={collaborationStartLabel}
            isAlumni={member.isAlumni}
            alumniLabel={isFa ? "عضو پیشین" : "Former member"}
            learnMoreLabel={isFa ? "بیشتر بدانید" : "Learn more"}
            downloadResumeLabel={isFa ? "دانلود رزومه" : "Download resume"}
            printLabel={isFa ? "چاپ" : "Print"}
          />
        );
      })}
    </div>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const members = await prisma.teamMember.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  const activeMembers = members.filter((member) => !member.isAlumni);
  const alumniMembers = members.filter((member) => member.isAlumni);

  return (
    <>
      <PageHeader
        title={isFa ? "پرسنل" : "Team"}
        subtitle={isFa ? "مربیان و اعضای تیم پیشنام." : "Pishnam's instructors and team members."}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {members.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "اطلاعات تیم به‌زودی منتشر می‌شود." : "Team info coming soon."}
          </p>
        ) : (
          <div className="flex flex-col gap-14">
            {activeMembers.length > 0 && (
              <section>
                {alumniMembers.length > 0 && (
                  <h2 className="text-text-primary mb-6 text-lg font-bold">
                    {isFa ? "تیم فعلی" : "Current team"}
                  </h2>
                )}
                <TeamMemberGrid members={activeMembers} appLocale={appLocale} isFa={isFa} />
              </section>
            )}

            {alumniMembers.length > 0 && (
              <section>
                <div className="mb-6 flex flex-col gap-2">
                  <h2 className="text-text-primary text-lg font-bold">
                    {isFa ? "اعضای پیشین" : "Former members"}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    {isFa
                      ? "افرادی که در مسیر پیشنام نقش داشته‌اند و اکنون در مسیرهای دیگر ادامه می‌دهند."
                      : "People who shaped Pishnam and now continue on other paths."}
                  </p>
                </div>
                <TeamMemberGrid members={alumniMembers} appLocale={appLocale} isFa={isFa} />
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
