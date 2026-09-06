export const SEARCH_KINDS = [
  "page",
  "course",
  "product",
  "class",
  "software",
  "datasheet",
  "download",
  "poster",
  "video",
  "article",
  "team",
  "achievement",
  "license",
  "faq",
  "job",
  "press",
  "gallery",
] as const;

export type SearchKind = (typeof SEARCH_KINDS)[number];

export type SearchHit = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
  external?: boolean;
  keywords: string;
};
