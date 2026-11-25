import type { ContactAddress } from "@prisma/client";

/** Cap shared by the Zod schema and the admin repeater. */
export const MAX_CONTACT_ADDRESSES = 10;
export const MAX_CONTACT_BRANCH_NAME_LENGTH = 100;

export type ContactAddressFields = Pick<
  ContactAddress,
  "nameFa" | "nameEn" | "addressFa" | "addressEn" | "postalCode" | "phones" | "mapEmbedUrl"
>;

/** An address localized for the current locale, with empty rows removed. */
export type DisplayContactAddress = {
  id: string;
  name: string;
  address: string;
  postalCode: string | null;
  phones: string[];
  mapEmbedUrl: string | null;
};

/**
 * Contact addresses are bilingual with a fallback, exactly like the old
 * singleton address was: show the requested language, otherwise the other one.
 */
export function localizedAddressText(
  address: Pick<ContactAddress, "addressFa" | "addressEn">,
  isFa: boolean,
): string | null {
  const preferred = isFa ? address.addressFa : address.addressEn;
  const fallback = isFa ? address.addressEn : address.addressFa;
  return preferred?.trim() || fallback?.trim() || null;
}

/** Maps stored rows to what the public components render, in display order. */
export function toDisplayAddresses(
  addresses: ContactAddress[],
  isFa: boolean,
): DisplayContactAddress[] {
  const visibleAddresses = addresses.filter(
    (address) =>
      address.nameFa?.trim() ||
      address.nameEn?.trim() ||
      localizedAddressText(address, isFa) ||
      address.postalCode ||
      address.phones?.length ||
      address.mapEmbedUrl,
  );

  // Resolve labels before filtering maps, so a map for the second branch never
  // gets relabeled as the first branch when the first has no embedded map.
  return visibleAddresses.map((address, index) => ({
    id: address.id,
    name: contactAddressLabel(index, isFa, visibleAddresses.length, address),
    address: localizedAddressText(address, isFa) ?? "",
    postalCode: address.postalCode,
    phones: address.phones ?? [],
    mapEmbedUrl: address.mapEmbedUrl,
  }));
}

/** Prefer the localized branch name; number unnamed branches only when needed. */
export function contactAddressLabel(
  index: number,
  isFa: boolean,
  total: number,
  names?: Pick<ContactAddress, "nameFa" | "nameEn">,
): string {
  const preferred = isFa ? names?.nameFa : names?.nameEn;
  const fallback = isFa ? names?.nameEn : names?.nameFa;
  const name = preferred?.trim() || fallback?.trim();
  if (name) return name;

  const number = new Intl.NumberFormat(isFa ? "fa-IR" : "en-US").format(index + 1);
  if (total <= 1) return isFa ? "آدرس" : "Address";
  return isFa ? `آدرس ${number}` : `Address ${number}`;
}
