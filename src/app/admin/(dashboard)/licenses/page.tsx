import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteLicense } from "./actions";

export default async function AdminLicensesPage() {
  const licenses = await prisma.license.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <AdminListHeader title="مجوز‌ها" newHref="/admin/licenses/new" newLabel="افزودن مجوز" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={licenses}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز مجوزی ثبت نشده است."
          columns={[
            {
              header: "مجوز",
              cell: (row) => (
                <div className="flex items-center gap-3">
                  <div className="border-border bg-bg-surface-alt relative size-12 shrink-0 overflow-hidden rounded-md border">
                    <Image src={row.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">{row.titleFa}</p>
                    {row.issuerFa && <p className="text-text-secondary text-xs">{row.issuerFa}</p>}
                  </div>
                </div>
              ),
            },
            {
              header: "سال",
              cell: (row) => row.year ?? "—",
              className: "text-text-secondary",
            },
            {
              header: "ترتیب",
              cell: (row) => row.order,
              className: "text-text-secondary",
            },
            {
              header: "وضعیت",
              cell: (row) => (row.active ? "فعال" : "غیرفعال"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/licenses/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteLicense.bind(null, row.id)}
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
