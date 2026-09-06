import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { createTeamMember } from "../actions";

export default async function NewTeamMemberPage() {
  const tags = await prisma.teamTag.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <Link
        href="/admin/team"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به پرسنل
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن عضو جدید</h1>
      <div className="mt-6">
        <TeamMemberForm
          action={createTeamMember}
          tags={tags.map((tag) => ({
            id: tag.id,
            nameFa: tag.nameFa,
            nameEn: tag.nameEn,
            active: tag.active,
          }))}
          submitLabel="ثبت عضو"
        />
      </div>
    </div>
  );
}
