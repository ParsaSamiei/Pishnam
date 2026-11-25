import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteFaq } from "./actions";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  return (
    <div>
      <AdminListHeader title="سوالات متداول" newHref="/admin/faqs/new" newLabel="افزودن سوال" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={faqs}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز سوالی ثبت نشده است."
          columns={[
            { header: "دسته‌بندی", cell: (row) => row.category, className: "text-text-secondary" },
            { header: "سوال", cell: (row) => row.questionFa },
            { header: "ترتیب", cell: (row) => row.order, className: "text-text-secondary" },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/faqs/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.questionFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteFaq.bind(null, row.id)}
                    itemLabel={row.questionFa}
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
