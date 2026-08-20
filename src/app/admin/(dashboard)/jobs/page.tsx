import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deleteJobPosting } from "./actions";

export default async function AdminJobsPage() {
  const jobs = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminListHeader
        title="فرصت‌های شغلی"
        newHref="/admin/jobs/new"
        newLabel="افزودن فرصت شغلی"
      />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={jobs}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز فرصت شغلی ثبت نشده است."
          columns={[
            { header: "عنوان", cell: (row) => row.titleFa },
            {
              header: "وضعیت",
              cell: (row) => (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    row.active
                      ? "bg-pishnam-success/15 text-pishnam-success"
                      : "bg-bg-surface-alt text-text-secondary",
                  )}
                >
                  {row.active ? "فعال" : "غیرفعال"}
                </span>
              ),
            },
            {
              header: "تاریخ انقضا",
              cell: (row) => (row.expiresAt ? formatDate(row.expiresAt, "fa") : "—"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/jobs/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteJobPosting.bind(null, row.id)}
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
