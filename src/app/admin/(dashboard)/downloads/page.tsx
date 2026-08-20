import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { downloadCategoryLabel } from "@/lib/download-categories";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteDownloadResource } from "./actions";

export default async function AdminDownloadsPage() {
  const resources = await prisma.downloadResource.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminListHeader title="مرکز دانلود" newHref="/admin/downloads/new" newLabel="افزودن مورد" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={resources}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز موردی ثبت نشده است."
          columns={[
            { header: "عنوان", cell: (row) => row.titleFa },
            {
              header: "دسته‌بندی",
              cell: (row) =>
                downloadCategoryLabel(row.category.toLowerCase().replace(/_/g, "-"), "fa"),
              className: "text-text-secondary",
            },
            {
              header: "نوع",
              cell: (row) => (row.source === "HOSTED" ? "فایل آپلودی" : "لینک خارجی"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/downloads/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteDownloadResource.bind(null, row.id)}
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
