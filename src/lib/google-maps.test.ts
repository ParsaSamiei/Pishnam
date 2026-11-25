import { describe, expect, it } from "vitest";
import { toGoogleMapsEmbedUrl } from "./google-maps";

const EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12";

describe("toGoogleMapsEmbedUrl", () => {
  it("returns null for empty input", () => {
    expect(toGoogleMapsEmbedUrl("")).toBeNull();
    expect(toGoogleMapsEmbedUrl("   ")).toBeNull();
  });

  it("accepts a bare embed URL", () => {
    expect(toGoogleMapsEmbedUrl(EMBED)).toBe(EMBED);
  });

  it("extracts src from a pasted iframe snippet", () => {
    const snippet = `<iframe src="${EMBED}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
    expect(toGoogleMapsEmbedUrl(snippet)).toBe(EMBED);
  });

  it("decodes &amp; in iframe src", () => {
    const snippet = `<iframe src="https://www.google.com/maps/embed?pb=abc&amp;foo=1"></iframe>`;
    expect(toGoogleMapsEmbedUrl(snippet)).toBe("https://www.google.com/maps/embed?pb=abc&foo=1");
  });

  it("accepts maps.google.com with output=embed", () => {
    const url = "https://maps.google.com/maps?q=Tehran&output=embed";
    expect(toGoogleMapsEmbedUrl(url)).toBe(url);
  });

  it("rejects share/place links that are not embeddable", () => {
    expect(toGoogleMapsEmbedUrl("https://www.google.com/maps/place/Tehran")).toBeNull();
    expect(toGoogleMapsEmbedUrl("https://maps.app.goo.gl/abc")).toBeNull();
  });

  it("rejects non-https and non-Google hosts", () => {
    expect(toGoogleMapsEmbedUrl("http://www.google.com/maps/embed?pb=1")).toBeNull();
    expect(toGoogleMapsEmbedUrl("https://evil.example/maps/embed?pb=1")).toBeNull();
    expect(toGoogleMapsEmbedUrl("https://google.com.evil.example/maps/embed?pb=1")).toBeNull();
  });
});
