import { describe, expect, it } from "vitest";
import { normalizeSearchText, searchTokens } from "./normalize";
import { filterAndGroupSearchHits, hitMatches, rankHit } from "./match";
import type { SearchHit } from "./types";

function hit(overrides: Partial<SearchHit> & Pick<SearchHit, "id" | "title">): SearchHit {
  return {
    kind: "page",
    subtitle: null,
    href: "/",
    image: null,
    keywords: "",
    ...overrides,
  };
}

describe("normalizeSearchText", () => {
  it("folds Arabic yeh/kaf to Persian", () => {
    expect(normalizeSearchText("يک ربات")).toBe(normalizeSearchText("یک ربات"));
  });

  it("maps Persian and Arabic digits to Latin", () => {
    expect(normalizeSearchText("srf۰۵")).toBe("srf05");
    expect(normalizeSearchText("srf٠٥")).toBe("srf05");
  });
});

describe("search matching", () => {
  const lcd = hit({
    id: "lcd",
    kind: "datasheet",
    title: "نمایشگر LCD 16×2",
    keywords: "character display lcd",
  });
  const course = hit({
    id: "course",
    kind: "course",
    title: "رباتیک ابتدایی",
    subtitle: "ابتدایی",
    keywords: "elementary robotics",
  });

  it("matches every token against title, subtitle, or keywords", () => {
    expect(hitMatches(lcd, "lcd 16")).toBe(true);
    expect(hitMatches(course, "elementary")).toBe(true);
    expect(hitMatches(course, "lcd")).toBe(false);
  });

  it("ranks title matches above keyword matches", () => {
    expect(rankHit(lcd, "lcd")).toBeLessThan(rankHit(course, "elementary"));
  });

  it("groups remaining hits and hides empty kinds", () => {
    const groups = filterAndGroupSearchHits([lcd, course], "ربات");
    expect(groups.map((group) => group.kind)).toEqual(["course"]);
  });

  it("returns everything grouped when the query is empty", () => {
    const groups = filterAndGroupSearchHits([lcd, course], "");
    expect(groups).toHaveLength(2);
    expect(groups[0]?.hits).toHaveLength(1);
  });

  it("tokenizes mixed scripts", () => {
    expect(searchTokens("  LCD  ۱۶  ")).toEqual(["lcd", "16"]);
  });
});
