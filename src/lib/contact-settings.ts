import "server-only";
import { prisma } from "@/lib/prisma";

/** Fixed primary key for the one ContactSettings row. */
export const CONTACT_SETTINGS_ID = "default";

export async function getContactSettings() {
  return prisma.contactSettings.findUnique({ where: { id: CONTACT_SETTINGS_ID } });
}
