import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteVideoEntry } from "./actions";

export default async function AdminVideosPage() {
  const videos = await prisma.videoEntry.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <AdminListHeader title="ویدیوها" newHref="/admin/videos/new" newLabel="افزودن ویدیو" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={videos}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز ویدیویی ثبت نشده است."
          columns={[
            {
              header: "منبع",
              cell: (row) => (row.hostedVideo ? "سرور" : "آپارات"),
              className: "text-text-secondary",
            },
            { header: "عنوان", cell: (row) => row.titleFa },
            {
              header: "تاریخ انتشار",
              cell: (row) => formatDate(row.publishedAt, "fa"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/videos/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteVideoEntry.bind(null, row.id)}
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
