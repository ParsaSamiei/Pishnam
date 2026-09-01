import { describe, expect, it } from "vitest";
import { localeFromPathname } from "./resolve-request-locale";

describe("localeFromPathname", () => {
  it("returns en for /en paths", () => {
    expect(localeFromPathname("/en/contact-us")).toBe("en");
    expect(localeFromPathname("/en")).toBe("en");
  });

  it("returns fa for unprefixed paths", () => {
    expect(localeFromPathname("/contact-us")).toBe("fa");
    expect(localeFromPathname("/this-page-does-not-exist")).toBe("fa");
  });

  it("ignores query strings", () => {
    expect(localeFromPathname("/en/foo?bar=1")).toBe("en");
  });
});
