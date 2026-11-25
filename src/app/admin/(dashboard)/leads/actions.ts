"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/actions/admin-guard";

const updateLeadSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function updateLead(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateLeadSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    note: formData.get("note"),
  });
  if (!parsed.success) return;

  await prisma.lead.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, note: parsed.data.note || null },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
