import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteAchievement } from "./actions";

export default async function AdminAchievementsPage() {
  const achievements = await prisma.achievement.findMany({ orderBy: { year: "desc" } });

  return (
    <div>
      <AdminListHeader
        title="افتخارات"
        newHref="/admin/achievements/new"
        newLabel="افزودن افتخار"
      />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={achievements}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز افتخاری ثبت نشده است."
          columns={[
            {
              header: "عنوان",
              cell: (row) => (
                <div className="flex items-center gap-2">
                  {row.featured && (
                    <Star
                      className="fill-pishnam-gold-500 text-pishnam-gold-500 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="font-medium">{row.titleFa}</span>
                </div>
              ),
            },
            { header: "مسابقه", cell: (row) => row.competition },
            { header: "سال", cell: (row) => row.year },
            { header: "نتیجه", cell: (row) => row.result },
            {
              header: "تاریخ ثبت",
              cell: (row) => formatDate(row.createdAt, "fa"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/achievements/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteAchievement.bind(null, row.id)}
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
