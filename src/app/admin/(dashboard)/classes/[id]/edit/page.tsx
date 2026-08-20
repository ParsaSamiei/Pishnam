import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassSessionForm } from "@/components/admin/class-session-form";
import { updateClassSession } from "../../actions";

export default async function EditClassSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, courses] = await Promise.all([
    prisma.classSession.findUnique({ where: { id } }),
    prisma.course.findMany({
      orderBy: { order: "asc" },
      include: { translations: { where: { locale: "fa" } } },
    }),
  ]);

  if (!session) {
    notFound();
  }

  const boundUpdate = updateClassSession.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/classes"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به کلاس‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش کلاس</h1>
      <div className="mt-6">
        <ClassSessionForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          courses={courses.map((c) => ({ id: c.id, title: c.translations[0]?.title ?? c.slug }))}
          defaultValues={session}
        />
      </div>
    </div>
  );
}
