"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { contactSettingsSchema } from "@/lib/validation/contact-settings";
import { CONTACT_SETTINGS_ID } from "@/lib/contact-settings";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface ContactSettingsFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function parseContactForm(formData: FormData) {
  return contactSettingsSchema.safeParse({
    ...Object.fromEntries(formData),
    phones: formData.getAll("phones"),
  });
}

function revalidateContactPages() {
  revalidatePath("/admin/contact");
  revalidatePath("/contact-us");
  revalidatePath("/en/contact-us");
  revalidatePath("/[locale]", "page");
}

export async function updateContactSettings(
  _prevState: ContactSettingsFormState,
  formData: FormData,
): Promise<ContactSettingsFormState> {
  await requireAdminSession();

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  await prisma.contactSettings.upsert({
    where: { id: CONTACT_SETTINGS_ID },
    create: { id: CONTACT_SETTINGS_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidateContactPages();
  redirect("/admin/contact?saved=1");
}
