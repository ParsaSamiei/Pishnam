import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteTeamMember } from "./actions";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminListHeader title="پرسنل" newHref="/admin/team/new" newLabel="افزودن عضو" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={members}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز عضوی ثبت نشده است."
          columns={[
            { header: "نام", cell: (row) => row.nameFa },
            { header: "سمت", cell: (row) => row.roleFa, className: "text-text-secondary" },
            { header: "ترتیب", cell: (row) => row.order, className: "text-text-secondary" },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/team/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.nameFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteTeamMember.bind(null, row.id)}
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
