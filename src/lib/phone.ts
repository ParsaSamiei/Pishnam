const DIGIT_MAP: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

const MOBILE = /^09\d{9}$/;
const LANDLINE = /^0[1-8]\d{9}$/;

/** Accepted public formats: `09xxxxxxxxx` (mobile) or `0xx xxxxxxxx` (landline). */
export const IRANIAN_PHONE_HINT_FA = "09xxxxxxxxx یا 0xx xxxxxxxx";
export const IRANIAN_PHONE_HINT_EN = "09xxxxxxxxx or 0xx xxxxxxxx";

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => DIGIT_MAP[digit] ?? digit);
}

/**
 * Returns a canonical Iranian phone number, or null when the value is not a
 * mobile (`09xxxxxxxxx`) or landline (`0xx xxxxxxxx`) number.
 */
export function parseIranianPhone(value: string): string | null {
  const latin = toLatinDigits(value).trim();
  if (!latin) return null;

  const digits = latin.replace(/[\s-]+/g, "");
  if (MOBILE.test(digits)) return digits;
  if (LANDLINE.test(digits)) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return null;
}
