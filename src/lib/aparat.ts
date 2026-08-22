/**
 * Aparat gives you the embed code in a few different shapes depending on
 * where you copy it from -- the "share > embed" dialog gives you a whole
 * `<div><script src="https://www.aparat.com/embed/{hash}?...">` snippet,
 * a share link looks like `https://www.aparat.com/v/{hash}`, and our own
 * `VideoEmbedCard` wants the direct iframe-able URL
 * (`https://www.aparat.com/video/video/embed/videohash/{hash}/vt/frame`).
 *
 * This lets the admin panel accept whatever was pasted -- full snippet,
 * share link, or an already-canonical URL -- and normalizes it to the
 * canonical form so it can be stored and rendered as-is.
 */

const HASH_PATTERNS = [
  // Checked before the generic /embed/ pattern below: the canonical URL
  // itself contains "embed/videohash/", so /embed/ would otherwise match
  // "videohash" as the hash instead of the real one that follows it.
  /\/videohash\/([a-zA-Z0-9]+)/, // .../videohash/{hash}/vt/frame (already canonical)
  /\/embed\/([a-zA-Z0-9]+)/, // .../embed/{hash}  (script src, snippet or bare url)
  /\/v\/([a-zA-Z0-9]+)/, // .../v/{hash}  (share link)
];

export function extractAparatHash(input: string): string | null {
  for (const pattern of HASH_PATTERNS) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function toAparatEmbedUrl(input: string): string | null {
  const hash = extractAparatHash(input.trim());
  if (!hash) return null;
  return `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame`;
}

/**
 * Aparat's own public video-info endpoint (documented at
 * https://www.aparat.com/api, "video" method) -- given a hash, it returns
 * the video's metadata including `big_poster` / `small_poster`. Used to
 * populate the admin's thumbnail field automatically when no custom image
 * is uploaded, since Aparat's iframe itself doesn't expose a poster we can
 * show before the visitor presses play.
 */
export async function fetchAparatPoster(hash: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.aparat.com/etc/api/video/videohash/${hash}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const poster = data?.video?.big_poster || data?.video?.small_poster;
    return typeof poster === "string" && poster ? poster : null;
  } catch {
    // Network hiccup, unexpected response shape, or timeout -- fall back to
    // no thumbnail rather than blocking the admin from saving the entry.
    return null;
  }
}
