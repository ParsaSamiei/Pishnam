const ARABIC_YEH = /[\u064A\u0649]/g;
const ARABIC_KAF = /\u0643/g;
const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ZERO_WIDTH = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
const TATWEEL = /\u0640/g;

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

/** Fold FA/EN/Arabic variants so "ي" matches "ی" and "۱۲" matches "12". */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(ZERO_WIDTH, "")
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(ARABIC_YEH, "ی")
    .replace(ARABIC_KAF, "ک")
    .replace(/[۰-۹٠-٩]/g, (digit) => DIGIT_MAP[digit] ?? digit)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function searchTokens(query: string): string[] {
  return normalizeSearchText(query)
    .split(" ")
    .filter((token) => token.length > 0);
}
