export type MapProvider = "google" | "balad" | "neshan";

/** Canonical place name used when opening Google Maps. */
export const PISHNAM_MAP_SEARCH_QUERY = "آموزشگاه رباتیک پیشنام";

export const PISHNAM_BALAD_URL =
  "https://balad.ir/p/3SApyUrhVAagZY?preview=true#15/35.74669/51.50718";

export const PISHNAM_NESHAN_URL =
  "https://neshan.org/maps/places/92029409282f76ee7baa91256b918152#c35.746-51.504-18z-0p";

export function toGoogleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function toBaladUrl(): string {
  return PISHNAM_BALAD_URL;
}

export function toNeshanUrl(): string {
  return PISHNAM_NESHAN_URL;
}

export function toMapUrl(provider: MapProvider, query = PISHNAM_MAP_SEARCH_QUERY): string {
  switch (provider) {
    case "google":
      return toGoogleMapsUrl(query);
    case "balad":
      return toBaladUrl();
    case "neshan":
      return toNeshanUrl();
  }
}

export const MAP_PROVIDERS: MapProvider[] = ["google", "balad", "neshan"];
