import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { FeedbackDetailDialog } from "@/components/admin/feedback-detail-dialog";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deleteFeedback } from "./actions";

function preview(text: string, max = 80): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}…`;
}

export default async function AdminFeedbackPage() {
  const items = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminListHeader title="انتقادات و پیشنهادات" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={items}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز انتقاد یا پیشنهادی ثبت نشده است."
          columns={[
            {
              header: "نام",
              cell: (row) => (
                <FeedbackDetailDialog
                  feedback={row}
                  trigger={
                    <span
                      className={cn(
                        "text-pishnam-steel-600 font-medium hover:underline",
                        !row.read && "font-bold",
                      )}
                    >
                      {row.name?.trim() || "ناشناس"}
                    </span>
                  }
                />
              ),
            },
            {
              header: "متن",
              cell: (row) => (
                <span className={cn("text-text-secondary", !row.read && "text-text-primary")}>
                  {preview(row.message)}
                </span>
              ),
            },
            {
              header: "تاریخ",
              cell: (row) => formatDate(row.createdAt, "fa"),
              className: "text-text-secondary",
            },
            {
              header: "وضعیت",
              cell: (row) => (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    row.read
                      ? "bg-bg-surface-alt text-text-secondary"
                      : "bg-pishnam-gold-500/15 text-pishnam-gold-600",
                  )}
                >
                  {row.read ? "خوانده‌شده" : "جدید"}
                </span>
              ),
            },
            {
              header: "",
              className: "w-16 text-end",
              cell: (row) => (
                <div className="flex justify-end">
                  <DeleteButton
                    onDelete={deleteFeedback.bind(null, row.id)}
                    itemLabel={row.name?.trim() || "این پیام"}
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
