"use server";

import type { AdminFormState } from "@/lib/form-state";
import { formActionError } from "@/lib/form-state";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { contactSettingsSchema } from "@/lib/validation/contact-settings";
import { CONTACT_SETTINGS_CACHE_TAG, CONTACT_SETTINGS_ID } from "@/lib/contact-settings";
import { requireAdminSession } from "@/lib/actions/admin-guard";

export type ContactSettingsFormState = AdminFormState;

const ADDRESS_FIELDS = [
  "nameFa",
  "nameEn",
  "addressFa",
  "addressEn",
  "postalCode",
  "mapEmbedUrl",
] as const;
type AddressField = (typeof ADDRESS_FIELDS)[number];

/** The repeater submits one value per row under each shared field name. */
function parseAddressRows(formData: FormData) {
  const columns = {} as Record<AddressField, string[]>;
  for (const field of ADDRESS_FIELDS) {
    columns[field] = formData
      .getAll(field)
      .filter((value): value is string => typeof value === "string");
  }
  const rowCount = Math.max(0, ...ADDRESS_FIELDS.map((field) => columns[field].length));
  return Array.from({ length: rowCount }, (_, index) => ({
    nameFa: columns.nameFa[index] ?? "",
    nameEn: columns.nameEn[index] ?? "",
    addressFa: columns.addressFa[index] ?? "",
    addressEn: columns.addressEn[index] ?? "",
    postalCode: columns.postalCode[index] ?? "",
    mapEmbedUrl: columns.mapEmbedUrl[index] ?? "",
    // Phones are indexed by row because each branch has its own list.
    phones: formData
      .getAll(`addressPhones.${index}`)
      .filter((value): value is string => typeof value === "string"),
  }));
}

function parseContactForm(formData: FormData) {
  return contactSettingsSchema.safeParse({
    ...Object.fromEntries(formData),
    phones: formData.getAll("phones").filter((value): value is string => typeof value === "string"),
    addresses: parseAddressRows(formData),
  });
}

/** Keep indexed address errors distinct so the row that failed can show them. */
function contactFormError(issues: { path: PropertyKey[]; message: string }[], formData: FormData) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key =
      issue.path[0] === "addresses"
        ? issue.path.map(String).join(".")
        : String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return formActionError(errors, formData);
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
    return contactFormError(parsed.error.issues, formData);
  }

  const { addresses, ...settingsData } = parsed.data;
  const addressRows = addresses.map((address, order) => ({ ...address, order }));

  await prisma.contactSettings.upsert({
    where: { id: CONTACT_SETTINGS_ID },
    create: {
      id: CONTACT_SETTINGS_ID,
      ...settingsData,
      addresses: { create: addressRows },
    },
    update: {
      ...settingsData,
      // The form owns the whole ordered set; replacing it keeps deletions and
      // reordering in sync without per-row actions.
      addresses: { deleteMany: {}, create: addressRows },
    },
  });

  revalidateContactPages();
  redirect("/admin/contact?saved=1");
}
