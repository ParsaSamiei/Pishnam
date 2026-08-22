/**
 * Google Maps "Share > Embed a map" gives you a full iframe snippet. Some
 * people paste only the `src` URL. The contact page iframe needs a URL that
 * Google will actually serve inside a frame -- a regular /maps/place share
 * link or a maps.app.goo.gl short link will not load there.
 *
 * This accepts either paste shape and returns the canonical embed URL, or
 * null if the input is empty/unusable.
 */

const IFRAME_SRC_RE = /src=["']([^"']+)["']/i;

function isGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  // Exact google.com / *.google.com only -- a loose `google.[tld]` regex would
  // also match lookalikes like google.com.evil.example.
  return host === "google.com" || host.endsWith(".google.com");
}

function isEmbedPath(pathname: string): boolean {
  return pathname === "/maps/embed" || pathname.startsWith("/maps/embed/");
}

export function toGoogleMapsEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const iframeSrc = trimmed.match(IFRAME_SRC_RE)?.[1];
  const raw = (iframeSrc ?? trimmed).replace(/&amp;/g, "&");

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (!isGoogleMapsHost(parsed.hostname)) return null;
  if (parsed.username || parsed.password) return null;

  const embedViaQuery =
    parsed.pathname.startsWith("/maps") && parsed.searchParams.get("output") === "embed";

  if (!isEmbedPath(parsed.pathname) && !embedViaQuery) {
    return null;
  }

  parsed.hash = "";
  return parsed.toString();
}
