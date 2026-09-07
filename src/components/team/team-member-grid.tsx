import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { TeamMemberCard } from "@/components/team/team-member-card";
import { formatCollaborationStartLabel } from "@/lib/format";
import type { TeamMemberGender } from "@/lib/team-member-photo";
import { resolveTeamMemberPhoto } from "@/lib/team-member-photo";

export type TeamMemberCardData = {
  id: string;
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  gender: TeamMemberGender;
  photo: string | null;
  bioFa: string | null;
  bioEn: string | null;
  resume: string | null;
  collaborationStartDate: Date | null;
  isAlumni: boolean;
};

export function TeamMemberGrid({
  members,
  appLocale,
  isFa,
}: {
  members: TeamMemberCardData[];
  appLocale: AppLocale;
  isFa: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {members.map((member) => {
        const name = pickLocaleField(member.nameFa, member.nameEn, appLocale);
        const role = pickLocaleField(member.roleFa, member.roleEn, appLocale);
        const bio = pickLocaleField(member.bioFa, member.bioEn, appLocale);
        const collaborationStartLabel = member.collaborationStartDate
          ? formatCollaborationStartLabel(member.collaborationStartDate, appLocale)
          : null;

        return (
          <div key={member.id} className="w-[calc(50%-0.625rem)] sm:w-[calc(33.333%-0.834rem)]">
            <TeamMemberCard
              name={name}
              role={role}
              photo={resolveTeamMemberPhoto(member.photo, member.gender)}
              bio={bio}
              resume={member.resume}
              collaborationStartLabel={collaborationStartLabel}
              isAlumni={member.isAlumni}
              alumniLabel={isFa ? "عضو پیشین" : "Former member"}
              learnMoreLabel={isFa ? "بیشتر بدانید" : "Learn more"}
              downloadResumeLabel={isFa ? "دانلود رزومه" : "Download resume"}
              printLabel={isFa ? "چاپ" : "Print"}
            />
          </div>
        );
      })}
    </div>
  );
}

export type TeamTagSectionData = {
  slug: string;
  nameFa: string;
  nameEn: string;
  members: TeamMemberCardData[];
};

export function TeamPageContent({
  tags,
  alumni,
  appLocale,
  isFa,
}: {
  tags: TeamTagSectionData[];
  alumni: TeamMemberCardData[];
  appLocale: AppLocale;
  isFa: boolean;
}) {
  if (tags.length === 0 && alumni.length === 0) {
    return (
      <p className="text-text-secondary text-center">
        {isFa ? "اطلاعات تیم به‌زودی منتشر می‌شود." : "Team info coming soon."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {tags.map((tag) => {
        const title = pickLocaleField(tag.nameFa, tag.nameEn, appLocale);
        return (
          <section
            key={tag.slug}
            id={tag.slug}
            className="scroll-mt-24"
            aria-labelledby={`team-tag-${tag.slug}`}
          >
            <h2 id={`team-tag-${tag.slug}`} className="text-text-primary mb-4 text-lg font-bold">
              {title}
            </h2>
            <TeamMemberGrid members={tag.members} appLocale={appLocale} isFa={isFa} />
          </section>
        );
      })}

      {alumni.length > 0 && (
        <section id="alumni" className="scroll-mt-24" aria-labelledby="team-alumni-heading">
          <div className="mb-4 flex flex-col gap-1.5">
            <h2 id="team-alumni-heading" className="text-text-primary text-lg font-bold">
              {isFa ? "اعضای پیشین" : "Former members"}
            </h2>
            <p className="text-text-secondary text-sm">
              {isFa
                ? "افرادی که در مسیر پیشنام نقش داشته‌اند و اکنون در مسیرهای دیگر ادامه می‌دهند."
                : "People who shaped Pishnam and now continue on other paths."}
            </p>
          </div>
          <TeamMemberGrid members={alumni} appLocale={appLocale} isFa={isFa} />
        </section>
      )}
    </div>
  );
}
