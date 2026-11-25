import { describe, expect, it } from "vitest";
import type { ContactAddress } from "@prisma/client";
import { contactAddressLabel, toDisplayAddresses } from "./contact-addresses";

function row(overrides: Partial<ContactAddress> = {}): ContactAddress {
  return {
    id: "id",
    contactSettingsId: "default",
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
      { id: "postal", address: "", postalCode: "1234567890", phones: [] },
    ]);
  });

  it("keeps a branch with only phone numbers", () => {
    expect(toDisplayAddresses([row({ id: "phone", phones: ["021 11111111"] })], false)).toEqual([
      { id: "phone", address: "", postalCode: null, phones: ["021 11111111"] },
    ]);
  });

  it("keeps phone lists attached to their own address", () => {
    const addresses = [
      row({ id: "first", addressEn: "First branch", phones: ["021 11111111"] }),
      row({ id: "second", addressEn: "Second branch", phones: ["071 22222222", "09120000000"] }),
    ];
    expect(toDisplayAddresses(addresses, false)).toEqual([
      { id: "first", address: "First branch", postalCode: null, phones: ["021 11111111"] },
      {
        id: "second",
        address: "Second branch",
        postalCode: null,
        phones: ["071 22222222", "09120000000"],
      },
    ]);
  });
});

describe("contactAddressLabel", () => {
  it("is unnumbered for a single location and numbered for several", () => {
    expect(contactAddressLabel(0, true, 1)).toBe("آدرس");
    expect(contactAddressLabel(0, false, 1)).toBe("Address");
    expect(contactAddressLabel(1, true, 2)).toBe("آدرس ۲");
    expect(contactAddressLabel(1, false, 2)).toBe("Address 2");
  });
});
