import { describe, expect, it } from "vitest";
import {
  isoDateToJalali,
  jalaliMonthLength,
  jalaliToIsoDate,
  toGregorian,
  toJalali,
} from "./jalali";

describe("jalali", () => {
  it("converts Nowruz 1403 to Gregorian", () => {
    expect(toGregorian(1403, 1, 1)).toEqual({ gy: 2024, gm: 3, gd: 20 });
  });

  it("converts a mid-year Gregorian date to Jalali", () => {
    expect(toJalali(2026, 9, 8)).toEqual({ jy: 1405, jm: 6, jd: 17 });
  });

  it("round-trips ISO dates", () => {
    const iso = "2018-07-15";
    const jalali = isoDateToJalali(iso);
    expect(jalali).not.toBeNull();
    expect(jalaliToIsoDate(jalali!.jy, jalali!.jm, jalali!.jd)).toBe(iso);
  });

  it("returns 30 days for Esfand in a leap year", () => {
    // 1399 is a Jalali leap year.
    expect(jalaliMonthLength(1399, 12)).toBe(30);
    expect(jalaliMonthLength(1400, 12)).toBe(29);
  });
});
