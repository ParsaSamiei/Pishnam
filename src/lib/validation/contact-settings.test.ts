import { describe, expect, it } from "vitest";
import { MAX_CONTACT_ADDRESSES, MAX_CONTACT_BRANCH_NAME_LENGTH } from "@/lib/contact-addresses";
import { contactSettingsSchema } from "./contact-settings";

const emptyAddress = {
  nameFa: "",
  nameEn: "",
  addressFa: "",
  addressEn: "",
  postalCode: "",
  mapEmbedUrl: "",
};

describe("contactSettingsSchema", () => {
  it("trims branch names and preserves named branches without an address yet", () => {
    const parsed = contactSettingsSchema.parse({
      addresses: [{ ...emptyAddress, nameFa: " شعبه رسالت ", nameEn: " Resalat branch " }],
    });
    expect(parsed.addresses[0]).toEqual({
      nameFa: "شعبه رسالت",
      nameEn: "Resalat branch",
      addressFa: null,
      addressEn: null,
      postalCode: null,
      phones: [],
      mapEmbedUrl: null,
    });
  });

  it("normalizes cleared branch names to null without removing the address", () => {
    const parsed = contactSettingsSchema.parse({
      addresses: [{ ...emptyAddress, nameFa: "  ", addressFa: "تهران" }],
    });
    expect(parsed.addresses[0]?.nameFa).toBeNull();
    expect(parsed.addresses[0]?.nameEn).toBeNull();
    expect(parsed.addresses[0]?.addressFa).toBe("تهران");
  });

  it.each(["nameFa", "nameEn"])("rejects an oversized %s under the correct branch", (field) => {
    const parsed = contactSettingsSchema.safeParse({
      addresses: [
        { ...emptyAddress, addressFa: "تهران" },
        { ...emptyAddress, [field]: "a".repeat(MAX_CONTACT_BRANCH_NAME_LENGTH + 1) },
      ],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0]?.path).toEqual(["addresses", 1, field]);
  });

  it("accepts empty fields", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["", "  "],
      email: "",
      footerTaglineFa: "",
      footerTaglineEn: "",
      addresses: [emptyAddress],
      telegramUrl: "",
      baleUrl: "",
      youtubeUrl: "",
      aparatUrl: "",
      instagramUrl: "",
    });
    expect(parsed).toEqual({
      phones: [],
      email: null,
      footerTaglineFa: null,
      footerTaglineEn: null,
      addresses: [],
      telegramUrl: null,
      baleUrl: null,
      youtubeUrl: null,
      aparatUrl: null,
      instagramUrl: null,
    });
  });

  it("defaults addresses to an empty list when no rows are submitted", () => {
    const parsed = contactSettingsSchema.parse({ phones: [], email: "" });
    expect(parsed.addresses).toEqual([]);
  });

  it("keeps multiple phone numbers, email and several addresses", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["021 11111111", "09120000000"],
      email: "info@pishnam.ir",
      addresses: [
        {
          addressFa: "تهران، خیابان اول",
          addressEn: "Tehran, First Street",
          postalCode: "1234567890",
          mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18",
        },
        {
          addressFa: "شیراز، خیابان دوم",
          addressEn: "Shiraz, Second Street",
          postalCode: "",
          mapEmbedUrl: "",
        },
      ],
      telegramUrl: "https://t.me/pishnam",
      baleUrl: "https://ble.ir/pishnam",
      youtubeUrl: "https://www.youtube.com/@pishnam",
      aparatUrl: "https://www.aparat.com/pishnam",
      instagramUrl: "https://www.instagram.com/pishnam",
    });
    expect(parsed.phones).toEqual(["021 11111111", "09120000000"]);
    expect(parsed.email).toBe("info@pishnam.ir");
    expect(parsed.addresses).toHaveLength(2);
    expect(parsed.addresses[0]).toEqual({
      nameFa: null,
      nameEn: null,
      addressFa: "تهران، خیابان اول",
      addressEn: "Tehran, First Street",
      postalCode: "1234567890",
      phones: [],
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18",
    });
    expect(parsed.addresses[1]).toEqual({
      nameFa: null,
      nameEn: null,
      addressFa: "شیراز، خیابان دوم",
      addressEn: "Shiraz, Second Street",
      postalCode: null,
      phones: [],
      mapEmbedUrl: null,
    });
    expect(parsed.telegramUrl).toBe("https://t.me/pishnam");
    expect(parsed.baleUrl).toBe("https://ble.ir/pishnam");
    expect(parsed.youtubeUrl).toBe("https://www.youtube.com/@pishnam");
    expect(parsed.aparatUrl).toBe("https://www.aparat.com/pishnam");
    expect(parsed.instagramUrl).toBe("https://www.instagram.com/pishnam");
  });

  it("drops blank address rows but keeps the rest", () => {
    const parsed = contactSettingsSchema.parse({
      phones: [],
      email: "",
      addresses: [emptyAddress, { ...emptyAddress, addressFa: "تهران" }, emptyAddress],
    });
    expect(parsed.addresses).toHaveLength(1);
    expect(parsed.addresses[0]?.addressFa).toBe("تهران");
  });

  it("rejects more than the maximum number of addresses", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: [],
      email: "",
      addresses: Array.from({ length: MAX_CONTACT_ADDRESSES + 1 }, () => ({
        ...emptyAddress,
        addressFa: "تهران",
      })),
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: ["+98 21 1111 1111"],
      email: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("normalizes each branch's phone list separately from general numbers", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["09120000000"],
      addresses: [
        { ...emptyAddress, addressFa: "تهران", phones: ["۰۲۱-۱۱۱۱۱۱۱۱", "", "  "] },
        { ...emptyAddress, addressFa: "شیراز", phones: ["07122222222", "09121111111"] },
      ],
    });
    expect(parsed.phones).toEqual(["09120000000"]);
    expect(parsed.addresses.map((address) => address.phones)).toEqual([
      ["021 11111111"],
      ["071 22222222", "09121111111"],
    ]);
  });

  it("keeps a phone-only branch and drops a completely blank one", () => {
    const parsed = contactSettingsSchema.parse({
      addresses: [
        { ...emptyAddress, phones: ["", " "] },
        { ...emptyAddress, phones: ["02111111111"] },
      ],
    });
    expect(parsed.addresses).toHaveLength(1);
    expect(parsed.addresses[0]?.phones).toEqual(["021 11111111"]);
  });

  it("reports invalid branch numbers under the correct address", () => {
    const parsed = contactSettingsSchema.safeParse({
      addresses: [
        { ...emptyAddress, addressFa: "تهران", phones: ["02111111111"] },
        { ...emptyAddress, addressFa: "شیراز", phones: ["not-a-phone"] },
      ],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(["addresses", 1, "phones", 0]);
    }
  });

  it("limits each branch to ten phone numbers", () => {
    const parsed = contactSettingsSchema.safeParse({
      addresses: [{ ...emptyAddress, phones: Array(11).fill("02111111111") }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a non-embed Google Maps URL in an address", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: [],
      email: "",
      addresses: [{ ...emptyAddress, mapEmbedUrl: "https://www.google.com/maps/place/Tehran" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: [],
      email: "not-an-email",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a non-https social URL", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: [],
      email: "",
      telegramUrl: "http://t.me/pishnam",
    });
    expect(parsed.success).toBe(false);
  });
});
