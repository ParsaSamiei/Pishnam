import { describe, expect, it } from "vitest";
import { homepageStatsSchema } from "./homepage-stats";

describe("homepageStatsSchema", () => {
  it("accepts plain integer strings", () => {
    const parsed = homepageStatsSchema.safeParse({
      boysEnrolled: "1200",
      girlsEnrolled: "850",
      achievements: "45",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        boysEnrolled: 1200,
        girlsEnrolled: 850,
        achievements: 45,
      });
    }
  });

  it("accepts Persian digits", () => {
    const parsed = homepageStatsSchema.safeParse({
      boysEnrolled: "۱۲۰۰",
      girlsEnrolled: "۸۵۰",
      achievements: "۴۵",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.boysEnrolled).toBe(1200);
    }
  });

  it("rejects negatives and empties", () => {
    expect(
      homepageStatsSchema.safeParse({
        boysEnrolled: "-1",
        girlsEnrolled: "0",
        achievements: "0",
      }).success,
    ).toBe(false);
    expect(
      homepageStatsSchema.safeParse({
        boysEnrolled: "",
        girlsEnrolled: "0",
        achievements: "0",
      }).success,
    ).toBe(false);
  });
});
