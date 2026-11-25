import { describe, expect, it } from "vitest";
import { homepageStatsSchema } from "./homepage-stats";

const validLabels = {
  boysLabelFa: "پسران ثبت‌نام‌شده",
  boysLabelEn: "Boys enrolled",
  girlsLabelFa: "دختران ثبت‌نام‌شده",
  girlsLabelEn: "Girls enrolled",
  achievementsLabelFa: "افتخارات",
  achievementsLabelEn: "Achievements",
};

describe("homepageStatsSchema", () => {
  it("accepts plain integer strings with labels", () => {
    const parsed = homepageStatsSchema.safeParse({
      boysEnrolled: "1200",
      girlsEnrolled: "850",
      achievements: "45",
      ...validLabels,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        boysEnrolled: 1200,
        girlsEnrolled: 850,
        achievements: 45,
        ...validLabels,
      });
    }
  });

  it("accepts Persian digits", () => {
    const parsed = homepageStatsSchema.safeParse({
      boysEnrolled: "۱۲۰۰",
      girlsEnrolled: "۸۵۰",
      achievements: "۴۵",
      ...validLabels,
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
        ...validLabels,
      }).success,
    ).toBe(false);
    expect(
      homepageStatsSchema.safeParse({
        boysEnrolled: "",
        girlsEnrolled: "0",
        achievements: "0",
        ...validLabels,
      }).success,
    ).toBe(false);
  });

  it("rejects blank labels", () => {
    expect(
      homepageStatsSchema.safeParse({
        boysEnrolled: "1",
        girlsEnrolled: "1",
        achievements: "1",
        ...validLabels,
        boysLabelFa: "  ",
      }).success,
    ).toBe(false);
  });
});
