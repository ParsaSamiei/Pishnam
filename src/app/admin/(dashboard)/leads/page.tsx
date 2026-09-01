import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { LeadStatusBadge, LeadTypeLabel } from "@/components/admin/lead-status-badge";
import { LeadDetailDialog } from "@/components/admin/lead-detail-dialog";
import { Card } from "@/components/ui/card";
import { deleteLead } from "./actions";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminListHeader title="درخواست‌ها" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={leads}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز درخواستی ثبت نشده است."
          columns={[
            {
              header: "نوع",
              cell: (row) => (
                <LeadDetailDialog
                  lead={row}
                  trigger={
                    <span className="text-pishnam-steel-600 font-medium hover:underline">
                      <LeadTypeLabel type={row.type} />
                    </span>
                  }
                />
              ),
            },
            { header: "نام", cell: (row) => row.name },
            {
              header: "تماس",
              cell: (row) => (
                <span dir="ltr" className="text-text-secondary">
                  {row.phone || row.email || "—"}
                </span>
              ),
            },
            {
              header: "تاریخ",
              cell: (row) => formatDate(row.createdAt, "fa"),
              className: "text-text-secondary",
            },
            { header: "وضعیت", cell: (row) => <LeadStatusBadge status={row.status} /> },
            {
              header: "",
              className: "w-16 text-end",
              cell: (row) => (
                <div className="flex justify-end">
                  <DeleteButton onDelete={deleteLead.bind(null, row.id)} itemLabel={row.name} />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
