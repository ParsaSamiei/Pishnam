import { describe, expect, it } from "vitest";
import { createLeadFormSchema } from "./lead";

describe("createLeadFormSchema", () => {
  it("accepts a mobile number on enrollment", () => {
    const parsed = createLeadFormSchema("fa").parse({
      type: "ENROLL",
      name: "سارا",
      phone: "09121234567",
      email: "",
      message: "",
    });
    expect(parsed.phone).toBe("09121234567");
  });

  it("normalizes a landline without a space", () => {
    const parsed = createLeadFormSchema("en").parse({
      type: "CLASS_SEAT",
      name: "Sara",
      phone: "02112345678",
      email: "",
      message: "",
    });
    expect(parsed.phone).toBe("021 12345678");
  });

  it("rejects an invalid phone number", () => {
    const parsed = createLeadFormSchema("fa").safeParse({
      type: "ENROLL",
      name: "سارا",
      phone: "12345",
      email: "",
      message: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path[0] === "phone")).toBe(true);
    }
  });

  it("rejects international numbers that are not in the allowed formats", () => {
    const parsed = createLeadFormSchema("fa").safeParse({
      type: "GENERAL_CONTACT",
      name: "سارا",
      phone: "+98 21 1111 1111",
      email: "sara@example.com",
      message: "",
    });
    expect(parsed.success).toBe(false);
  });
});
