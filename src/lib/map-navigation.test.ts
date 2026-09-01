import { describe, expect, it } from "vitest";
import {
  PISHNAM_BALAD_URL,
  PISHNAM_MAP_SEARCH_QUERY,
  PISHNAM_NESHAN_URL,
  toBaladUrl,
  toGoogleMapsUrl,
  toMapUrl,
  toNeshanUrl,
} from "./map-navigation";

describe("map-navigation", () => {
  const query = "Tehran, Iran";

  it("builds Google Maps search URLs", () => {
    expect(toGoogleMapsUrl(query)).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tehran%2C%20Iran",
    );
  });

  it("uses the canonical Balad place URL", () => {
    expect(toBaladUrl()).toBe(PISHNAM_BALAD_URL);
    expect(PISHNAM_BALAD_URL).toBe(
      "https://balad.ir/p/3SApyUrhVAagZY?preview=true#15/35.74669/51.50718",
    );
  });

  it("uses the canonical Neshan place URL", () => {
    expect(toNeshanUrl()).toBe(PISHNAM_NESHAN_URL);
    expect(PISHNAM_NESHAN_URL).toBe(
      "https://neshan.org/maps/places/92029409282f76ee7baa91256b918152#c35.746-51.504-18z-0p",
    );
  });

  it("routes providers through toMapUrl", () => {
    expect(toMapUrl("google", query)).toContain("google.com/maps");
    expect(toMapUrl("balad")).toBe(PISHNAM_BALAD_URL);
    expect(toMapUrl("neshan")).toBe(PISHNAM_NESHAN_URL);
  });

  it("uses the canonical Pishnam branch search query for Google Maps", () => {
    expect(PISHNAM_MAP_SEARCH_QUERY).toBe("آموزشگاه رباتیک پیشنام");
    expect(toGoogleMapsUrl(PISHNAM_MAP_SEARCH_QUERY)).toContain(
      encodeURIComponent(PISHNAM_MAP_SEARCH_QUERY),
    );
  });
});
