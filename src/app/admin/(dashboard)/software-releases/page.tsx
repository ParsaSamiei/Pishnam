import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { softwarePlatformLabel } from "@/lib/software-platforms";
import { formatFileSize } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteSoftwareRelease } from "./actions";

export default async function AdminSoftwareReleasesPage() {
  const releases = await prisma.softwareRelease.findMany({
    orderBy: [{ productId: "asc" }, { order: "asc" }],
    include: { product: true },
  });

  return (
    <div>
      <AdminListHeader
        title="فایل‌های نرم‌افزار"
        newHref="/admin/software-releases/new"
        newLabel="افزودن فایل"
      />
      <p className="text-text-secondary mt-2 text-sm">
        هر ردیف یک فایل یا لینک برای یک پلتفرم مشخص (ویندوز، مک و ...) از یک نرم‌افزار است. برای
        افزودن نرم‌افزار جدید، اول از بخش{" "}
        <Link href="/admin/software" className="text-pishnam-gold-600 underline">
          نرم‌افزار و افزونه‌ها
        </Link>{" "}
        آن را بسازید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={releases}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز فایلی ثبت نشده است."
          columns={[
            { header: "نرم‌افزار", cell: (row) => row.product.titleFa },
            {
              header: "پلتفرم",
              cell: (row) => softwarePlatformLabel(row.platform, "fa"),
              className: "text-text-secondary",
            },
            { header: "نسخه", cell: (row) => row.versionLabel, className: "text-text-secondary" },
            {
              header: "نوع",
              cell: (row) => (row.source === "HOSTED" ? "فایل آپلودی" : "لینک خارجی"),
              className: "text-text-secondary",
            },
            {
              header: "حجم",
              cell: (row) => (row.source === "HOSTED" ? formatFileSize(row.fileSizeBytes) : "—"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/software-releases/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.product.titleFa} - ${row.versionLabel}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteSoftwareRelease.bind(null, row.id)}
                    itemLabel={`${row.product.titleFa} - ${softwarePlatformLabel(row.platform, "fa")}`}
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
