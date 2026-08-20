import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ClassSessionForm } from "@/components/admin/class-session-form";
import { createClassSession } from "../actions";

export default async function NewClassSessionPage() {
  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { translations: { where: { locale: "fa" } } },
  });

  return (
    <div>
      <Link
        href="/admin/classes"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به کلاس‌ها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن کلاس جدید</h1>
      <div className="mt-6">
        <ClassSessionForm
          action={createClassSession}
          submitLabel="ثبت کلاس"
          courses={courses.map((c) => ({ id: c.id, title: c.translations[0]?.title ?? c.slug }))}
        />
      </div>
    </div>
  );
}
