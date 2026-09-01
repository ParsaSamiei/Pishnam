"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { contactSettingsSchema } from "@/lib/validation/contact-settings";
import { CONTACT_SETTINGS_CACHE_TAG, CONTACT_SETTINGS_ID } from "@/lib/contact-settings";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type ContactSettingsFormState = AdminFormState;

function parseContactForm(formData: FormData) {
  return contactSettingsSchema.safeParse({
    ...Object.fromEntries(formData),
    phones: formData.getAll("phones"),
  });
}

function revalidateContactPages() {
  updateTag(CONTACT_SETTINGS_CACHE_TAG);
  revalidatePath("/admin/contact");
  revalidatePath("/contact-us");
  revalidatePath("/en/contact-us");
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/[locale]", "page");
}

export async function updateContactSettings(
  _prevState: ContactSettingsFormState,
  formData: FormData,
): Promise<ContactSettingsFormState> {
  await requireAdminSession();

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.contactSettings.upsert({
    where: { id: CONTACT_SETTINGS_ID },
    create: { id: CONTACT_SETTINGS_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidateContactPages();
  redirect("/admin/contact?saved=1");
}
