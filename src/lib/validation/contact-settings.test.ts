import { describe, expect, it } from "vitest";
import { contactSettingsSchema } from "./contact-settings";

describe("contactSettingsSchema", () => {
  it("accepts empty fields", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["", "  "],
      email: "",
      addressFa: "",
      addressEn: "",
      mapEmbedUrl: "",
    });
    expect(parsed).toEqual({
      phones: [],
      email: null,
      addressFa: null,
      addressEn: null,
      mapEmbedUrl: null,
    });
  });

  it("keeps multiple phone numbers and a valid email", () => {
    const parsed = contactSettingsSchema.parse({
      phones: ["+98 21 1111 1111", "09120000000"],
      email: "info@pishnam.ir",
      addressFa: "تهران",
      addressEn: "Tehran",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18",
    });
    expect(parsed.phones).toEqual(["+98 21 1111 1111", "09120000000"]);
    expect(parsed.email).toBe("info@pishnam.ir");
    expect(parsed.mapEmbedUrl).toBe("https://www.google.com/maps/embed?pb=!1m18");
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
});
