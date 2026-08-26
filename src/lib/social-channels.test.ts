import { describe, expect, it } from "vitest";
import { getSocialLinks } from "./social-channels";

describe("getSocialLinks", () => {
  it("returns only channels with a URL", () => {
    expect(
      getSocialLinks({
        telegramUrl: "https://t.me/pishnam",
        baleUrl: null,
        youtubeUrl: "  ",
        aparatUrl: "https://www.aparat.com/pishnam",
      }),
    ).toEqual([
      {
        id: "telegram",
        href: "https://t.me/pishnam",
        labelFa: "تلگرام",
        labelEn: "Telegram",
      },
      {
        id: "aparat",
        href: "https://www.aparat.com/pishnam",
        labelFa: "آپارات",
        labelEn: "Aparat",
      },
    ]);
  });

  it("returns an empty list when settings are missing", () => {
    expect(getSocialLinks(null)).toEqual([]);
  });
});
