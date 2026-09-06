import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { updateTeamMember } from "../../actions";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, tags] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { id },
      include: { tags: { select: { tagId: true } } },
    }),
    prisma.teamTag.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!member) {
    notFound();
  }

  const { tags: memberTags, ...memberFields } = member;

  return (
    <div>
      <Link
        href="/admin/team"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به پرسنل
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش عضو</h1>
      <div className="mt-6">
        <TeamMemberForm
          action={updateTeamMember.bind(null, id)}
          tags={tags.map((tag) => ({
            id: tag.id,
            nameFa: tag.nameFa,
            nameEn: tag.nameEn,
            active: tag.active,
          }))}
          defaultValues={{
            ...memberFields,
            tagIds: memberTags.map((row) => row.tagId),
          }}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
