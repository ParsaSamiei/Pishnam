import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamTagForm } from "@/components/admin/team-tag-form";
import { updateTeamTag } from "../../actions";

export default async function EditTeamTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tag = await prisma.teamTag.findUnique({ where: { id } });

  if (!tag) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/team-tags"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دسته‌بندی پرسنل
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش دسته‌بندی</h1>
      <div className="mt-6">
        <TeamTagForm
          action={updateTeamTag.bind(null, id)}
          defaultValues={tag}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
