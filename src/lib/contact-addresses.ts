import type { ContactAddress } from "@prisma/client";

/** Cap shared by the Zod schema and the admin repeater. */
export const MAX_CONTACT_ADDRESSES = 10;

export type ContactAddressFields = Pick<
  ContactAddress,
  "addressFa" | "addressEn" | "postalCode" | "phones" | "mapEmbedUrl"
>;

/** An address localized for the current locale, with empty rows removed. */
export type DisplayContactAddress = {
  id: string;
  address: string;
  postalCode: string | null;
  phones: string[];
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
  return addresses.flatMap((address) => {
    const text = localizedAddressText(address, isFa);
    const phones = address.phones ?? [];
    // A branch can have only a phone number while its address is being added.
    if (!text && !address.postalCode && phones.length === 0) return [];
    return [
      {
        id: address.id,
        address: text ?? "",
        postalCode: address.postalCode,
        phones,
      },
    ];
  });
}

/** Only worth numbering when there is more than one location. */
export function contactAddressLabel(index: number, isFa: boolean, total: number): string {
  const number = new Intl.NumberFormat(isFa ? "fa-IR" : "en-US").format(index + 1);
  if (total <= 1) return isFa ? "آدرس" : "Address";
  return isFa ? `آدرس ${number}` : `Address ${number}`;
}
