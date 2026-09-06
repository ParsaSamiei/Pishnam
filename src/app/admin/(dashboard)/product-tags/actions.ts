"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productTagSchema } from "@/lib/validation/product-tag";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type ProductTagFormState = AdminFormState;

function revalidateProductTagPages() {
  revalidatePath("/admin/product-tags");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/en/products");
}

export async function createProductTag(
  _prevState: ProductTagFormState,
  formData: FormData,
): Promise<ProductTagFormState> {
  await requireAdminSession();

  const parsed = productTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const slugTaken = await prisma.productTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugTaken) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.productTag.create({ data: parsed.data });

  revalidateProductTagPages();
  redirect("/admin/product-tags");
}

export async function updateProductTag(
  id: string,
  _prevState: ProductTagFormState,
  formData: FormData,
): Promise<ProductTagFormState> {
  await requireAdminSession();

  const parsed = productTagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.productTag.findUnique({ where: { id } });
  if (!existing) {
    return formActionError({ slug: "نوع محصول یافت نشد." }, formData);
  }

  const slugOwner = await prisma.productTag.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugOwner && slugOwner.id !== id) {
    return formActionError({ slug: "این نامک قبلاً استفاده شده است." }, formData);
  }

  await prisma.productTag.update({ where: { id }, data: parsed.data });

  revalidateProductTagPages();
  redirect("/admin/product-tags");
}

export async function deleteProductTag(id: string): Promise<void | { error?: string }> {
  await requireAdminSession();
  const linked = await prisma.productTagOnProduct.count({ where: { tagId: id } });
  if (linked > 0) {
    return { error: "نمی‌توان نوعی را که به محصولی وصل است حذف کرد. ابتدا محصول‌ها را جدا کنید." };
  }
  await prisma.productTag.delete({ where: { id } });
  revalidateProductTagPages();
}
