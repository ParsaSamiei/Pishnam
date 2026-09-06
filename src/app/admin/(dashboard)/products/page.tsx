import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      tags: { include: { tag: true }, orderBy: { tag: { order: "asc" } } },
    },
  });

  return (
    <div>
      <AdminListHeader title="محصولات" newHref="/admin/products/new" newLabel="افزودن محصول" />
      <p className="text-text-secondary mt-2 text-sm">
        ویترین محصولات با صفحه اختصاصی برای هر مورد. انواع را از{" "}
        <Link href="/admin/product-tags" className="text-pishnam-gold-600 underline">
          انواع محصول
        </Link>{" "}
        مدیریت کنید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={products}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز محصولی ثبت نشده است."
          columns={[
            {
              header: "تصویر",
              className: "w-20",
              cell: (row) => (
                <div className="border-border bg-bg-surface-alt relative size-12 overflow-hidden rounded-md border">
                  <Image src={row.image} alt="" fill className="object-cover" sizes="48px" />
                </div>
              ),
            },
            {
              header: "عنوان",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.titleFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    /products/{row.slug}
                  </p>
                </div>
              ),
            },
            {
              header: "انواع",
              cell: (row) =>
                row.tags.length > 0
                  ? row.tags.map((assignment) => assignment.tag.nameFa).join("، ")
                  : "—",
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
                    href={`/admin/products/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteProduct.bind(null, row.id)}
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
