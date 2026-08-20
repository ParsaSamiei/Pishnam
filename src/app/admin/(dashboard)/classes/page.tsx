import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatWeekday } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteClassSession } from "./actions";

export default async function AdminClassesPage() {
  const sessions = await prisma.classSession.findMany({
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    include: { course: { include: { translations: { where: { locale: "fa" } } } } },
  });

  return (
    <div>
      <AdminListHeader title="کلاس‌های حضوری" newHref="/admin/classes/new" newLabel="افزودن کلاس" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={sessions}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز کلاسی ثبت نشده است."
          columns={[
            { header: "دوره", cell: (row) => row.course.translations[0]?.title },
            { header: "روز", cell: (row) => formatWeekday(row.weekday, "fa") },
            {
              header: "ساعت",
              cell: (row) => `${row.startTime} – ${row.endTime}`,
              className: "text-text-secondary",
            },
            { header: "محل", cell: (row) => row.location, className: "text-text-secondary" },
            {
              header: "وضعیت",
              cell: (row) => (
                <span
                  className={
                    row.active
                      ? "bg-pishnam-success/15 text-pishnam-success rounded-full px-2 py-0.5 text-xs font-semibold"
                      : "bg-bg-surface-alt text-text-secondary rounded-full px-2 py-0.5 text-xs font-semibold"
                  }
                >
                  {row.active ? "فعال" : "غیرفعال"}
                </span>
              ),
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/classes/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label="ویرایش"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteClassSession.bind(null, row.id)}
                    itemLabel={`${row.course.translations[0]?.title} - ${formatWeekday(row.weekday, "fa")}`}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
