import { describe, expect, it } from "vitest";
import { contactSettingsSchema } from "./contact-settings";

describe("contactSettingsSchema", () => {
  it("accepts empty fields", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["", "  "],
      email: "",
      addressFa: "",
      addressEn: "",
      postalCode: "",
      footerTaglineFa: "",
      footerTaglineEn: "",
      mapEmbedUrl: "",
      telegramUrl: "",
      baleUrl: "",
      youtubeUrl: "",
      aparatUrl: "",
      instagramUrl: "",
    });
    expect(parsed).toEqual({
      phones: [],
      email: null,
      addressFa: null,
      addressEn: null,
      postalCode: null,
      footerTaglineFa: null,
      footerTaglineEn: null,
      mapEmbedUrl: null,
      telegramUrl: null,
      baleUrl: null,
      youtubeUrl: null,
      aparatUrl: null,
      instagramUrl: null,
    });
  });

  it("keeps multiple phone numbers and a valid email", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["021 11111111", "09120000000"],
      email: "info@pishnam.ir",
      addressFa: "تهران",
      addressEn: "Tehran",
      postalCode: "1234567890",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18",
      telegramUrl: "https://t.me/pishnam",
      baleUrl: "https://ble.ir/pishnam",
      youtubeUrl: "https://www.youtube.com/@pishnam",
      aparatUrl: "https://www.aparat.com/pishnam",
      instagramUrl: "https://www.instagram.com/pishnam",
    });
    expect(parsed.phones).toEqual(["021 11111111", "09120000000"]);
    expect(parsed.email).toBe("info@pishnam.ir");
    expect(parsed.postalCode).toBe("1234567890");
    expect(parsed.mapEmbedUrl).toBe("https://www.google.com/maps/embed?pb=!1m18");
    expect(parsed.telegramUrl).toBe("https://t.me/pishnam");
    expect(parsed.baleUrl).toBe("https://ble.ir/pishnam");
    expect(parsed.youtubeUrl).toBe("https://www.youtube.com/@pishnam");
    expect(parsed.aparatUrl).toBe("https://www.aparat.com/pishnam");
    expect(parsed.instagramUrl).toBe("https://www.instagram.com/pishnam");
  });

  it("rejects an invalid phone number", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: ["+98 21 1111 1111"],
      email: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a non-embed Google Maps URL", () => {
    const parsed = contactSettingsSchema.safeParse({
      phones: [],
      email: "",
      mapEmbedUrl: "https://www.google.com/maps/place/Tehran",
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
