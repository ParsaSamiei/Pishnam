import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { updateTeamMember } from "../../actions";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });

  if (!member) {
    notFound();
  }

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
          defaultValues={member}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
