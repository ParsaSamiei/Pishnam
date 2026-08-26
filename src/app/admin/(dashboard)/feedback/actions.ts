"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/actions/admin-guard";

const updateFeedbackSchema = z.object({
  id: z.string().min(1),
  read: z.enum(["true", "false"]),
  approved: z.enum(["true", "false"]),
});

function revalidateFeedback() {
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  revalidatePath("/feedback");
  revalidatePath("/en/feedback");
}

export async function updateFeedback(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateFeedbackSchema.safeParse({
    id: formData.get("id"),
    read: formData.get("read"),
    approved: formData.get("approved"),
  });
  if (!parsed.success) return;

  await prisma.feedback.update({
    where: { id: parsed.data.id },
    data: {
      read: parsed.data.read === "true",
      approved: parsed.data.approved === "true",
    },
  });

  revalidateFeedback();
}

export async function deleteFeedback(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.feedback.delete({ where: { id } });
  revalidateFeedback();
}
