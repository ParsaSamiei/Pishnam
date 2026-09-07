import { describe, expect, it } from "vitest";
import { parseIranianPhone } from "./phone";

describe("parseIranianPhone", () => {
  it("accepts a mobile number", () => {
    expect(parseIranianPhone("09121234567")).toBe("09121234567");
  });

  it("accepts a landline with the required space", () => {
    expect(parseIranianPhone("021 12345678")).toBe("021 12345678");
  });

  it("normalizes a landline typed without a space", () => {
    expect(parseIranianPhone("02112345678")).toBe("021 12345678");
  });

  it("accepts Persian digits", () => {
    expect(parseIranianPhone("۰۹۱۲۱۲۳۴۵۶۷")).toBe("09121234567");
    expect(parseIranianPhone("۰۲۱ ۱۲۳۴۵۶۷۸")).toBe("021 12345678");
  });

  it("rejects incomplete, international, and non-Iranian formats", () => {
    expect(parseIranianPhone("9121234567")).toBeNull();
    expect(parseIranianPhone("0912123456")).toBeNull();
    expect(parseIranianPhone("091212345678")).toBeNull();
    expect(parseIranianPhone("+98 21 1111 1111")).toBeNull();
    expect(parseIranianPhone("0211234567")).toBeNull();
    expect(parseIranianPhone("abc")).toBeNull();
    expect(parseIranianPhone("")).toBeNull();
  });
});
