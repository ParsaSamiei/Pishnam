import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteCompetition } from "./actions";

export default async function AdminCompetitionsPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { leagues: true } } },
  });

  return (
    <div>
      <AdminListHeader title="مسابقات" newHref="/admin/competitions/new" newLabel="افزودن مسابقه" />
      <p className="text-text-secondary mt-2 text-sm">
        هر مسابقه می‌تواند چند لیگ داشته باشد. لیگ‌ها، دسته‌بندی پوسترها و خود پوسترها را از بخش‌های
        مربوطه مدیریت کنید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={competitions}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز مسابقه‌ای ثبت نشده است."
          columns={[
            {
              header: "عنوان",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.titleFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    {row.slug}
                    {row.year ? ` · ${row.year}` : ""}
                  </p>
                </div>
              ),
            },
            {
              header: "تعداد لیگ‌ها",
              cell: (row) => row._count.leagues,
              className: "text-text-secondary",
            },
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
                    href={`/admin/competitions/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteCompetition.bind(null, row.id)}
                    itemLabel={row.titleFa}
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
