import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteAchievementTag } from "./actions";

export default async function AdminAchievementTagsPage() {
  const tags = await prisma.achievementTag.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { achievements: true } } },
  });

  return (
    <div>
      <AdminListHeader
        title="برچسب افتخارات"
        newHref="/admin/achievement-tags/new"
        newLabel="افزودن برچسب"
      />
      <p className="text-text-secondary mt-2 text-sm">
        این برچسب‌ها روی کارت افتخار و به‌صورت دکمه فیلتر در صفحه عمومی نمایش داده می‌شوند. هر
        افتخار را از بخش{" "}
        <Link href="/admin/achievements" className="text-pishnam-gold-600 underline">
          افتخارات
        </Link>{" "}
        به یکی از این برچسب‌ها وصل کنید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={tags}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز برچسبی ثبت نشده است."
          columns={[
            {
              header: "برچسب",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.nameFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    {row.slug}
                  </p>
                </div>
              ),
            },
            {
              header: "نام انگلیسی",
              cell: (row) => row.nameEn,
              className: "text-text-secondary",
            },
            {
              header: "افتخارات",
              cell: (row) => row._count.achievements,
              className: "text-text-secondary",
            },
            {
              header: "ترتیب",
              cell: (row) => row.order,
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
                    href={`/admin/achievement-tags/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.nameFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteAchievementTag.bind(null, row.id)}
                    itemLabel={row.nameFa}
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
