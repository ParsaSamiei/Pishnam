import { describe, expect, it } from "vitest";
import type { ContactAddress } from "@prisma/client";
import { contactAddressLabel, toDisplayAddresses } from "./contact-addresses";

function row(overrides: Partial<ContactAddress> = {}): ContactAddress {
  return {
    id: "id",
    contactSettingsId: "default",
    nameFa: null,
    nameEn: null,
    addressFa: null,
    addressEn: null,
    postalCode: null,
    phones: [],
    mapEmbedUrl: null,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("toDisplayAddresses", () => {
  it("shows name-only branches and keeps localized names together with their maps", () => {
    const addresses = [
      row({ id: "named", nameFa: "شعبه رسالت", nameEn: "Resalat branch" }),
      row({ id: "map", mapEmbedUrl: "https://www.google.com/maps/embed?pb=second" }),
    ];
    expect(toDisplayAddresses(addresses, false).map((address) => address.name)).toEqual([
      "Resalat branch",
      "Address 2",
    ]);
    expect(toDisplayAddresses(addresses, true).map((address) => address.name)).toEqual([
      "شعبه رسالت",
      "آدرس ۲",
    ]);
    expect(
      toDisplayAddresses(addresses, false).filter((address) => address.mapEmbedUrl)[0]?.name,
    ).toBe("Address 2");
  });

  it("prefers the requested language and falls back to the other one", () => {
    const addresses = [
      row({ id: "fa", addressFa: "تهران", addressEn: "Tehran" }),
      row({ id: "fallback", addressFa: "شیراز", addressEn: null }),
    ];
    expect(toDisplayAddresses(addresses, true).map((a) => a.address)).toEqual(["تهران", "شیراز"]);
    expect(toDisplayAddresses(addresses, false).map((a) => a.address)).toEqual(["Tehran", "شیراز"]);
  });

  it("keeps postal-code-only rows and drops completely empty rows", () => {
    const addresses = [row({ id: "postal", postalCode: "1234567890" }), row({ id: "empty" })];
    expect(toDisplayAddresses(addresses, true)).toEqual([
      {
        id: "postal",
        name: "آدرس",
        address: "",
        postalCode: "1234567890",
        phones: [],
        mapEmbedUrl: null,
      },
    ]);
  });

  it("keeps a branch with only phone numbers", () => {
    expect(toDisplayAddresses([row({ id: "phone", phones: ["021 11111111"] })], false)).toEqual([
      {
        id: "phone",
        name: "Address",
        address: "",
        postalCode: null,
        phones: ["021 11111111"],
        mapEmbedUrl: null,
      },
    ]);
  });

  it("keeps phone lists attached to their own address", () => {
    const addresses = [
      row({ id: "first", addressEn: "First branch", phones: ["021 11111111"] }),
      row({ id: "second", addressEn: "Second branch", phones: ["071 22222222", "09120000000"] }),
    ];
    expect(toDisplayAddresses(addresses, false)).toEqual([
      {
        id: "first",
        name: "Address 1",
        address: "First branch",
        postalCode: null,
        phones: ["021 11111111"],
        mapEmbedUrl: null,
      },
      {
        id: "second",
        name: "Address 2",
        address: "Second branch",
        postalCode: null,
        phones: ["071 22222222", "09120000000"],
        mapEmbedUrl: null,
      },
    ]);
  });
});

describe("contactAddressLabel", () => {
  it("prefers the saved name for the requested language", () => {
    const names = { nameFa: " شعبه رسالت ", nameEn: " Resalat branch " };
    expect(contactAddressLabel(0, true, 2, names)).toBe("شعبه رسالت");
    expect(contactAddressLabel(0, false, 2, names)).toBe("Resalat branch");
  });

  it("uses the other language when the requested name is missing", () => {
    expect(contactAddressLabel(0, false, 2, { nameFa: "شعبه رسالت", nameEn: " " })).toBe(
      "شعبه رسالت",
    );
    expect(contactAddressLabel(0, true, 2, { nameFa: null, nameEn: "Resalat branch" })).toBe(
      "Resalat branch",
    );
  });

  it("uses the original numbered label when both names are cleared", () => {
    expect(contactAddressLabel(1, true, 2, { nameFa: " ", nameEn: "" })).toBe("آدرس ۲");
  });

  it("is unnumbered for a single location and numbered for several", () => {
    expect(contactAddressLabel(0, true, 1)).toBe("آدرس");
    expect(contactAddressLabel(0, false, 1)).toBe("Address");
    expect(contactAddressLabel(1, true, 2)).toBe("آدرس ۲");
    expect(contactAddressLabel(1, false, 2)).toBe("Address 2");
  });
});
