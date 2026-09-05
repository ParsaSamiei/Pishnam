import { normalizeSearchText, searchTokens } from "./normalize";
import { SEARCH_KINDS, type SearchHit, type SearchKind } from "./types";

export type SearchHitGroup = {
  kind: SearchKind;
  hits: SearchHit[];
};

function haystackFor(hit: SearchHit): string {
  return normalizeSearchText([hit.title, hit.subtitle ?? "", hit.keywords].join(" "));
}

export function hitMatches(hit: SearchHit, query: string): boolean {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return true;
  const haystack = haystackFor(hit);
  return tokens.every((token) => haystack.includes(token));
}

export function rankHit(hit: SearchHit, query: string): number {
  const needle = normalizeSearchText(query);
  if (!needle) return 0;
  const title = normalizeSearchText(hit.title);
  if (title.startsWith(needle) || title.split(" ").some((word) => word.startsWith(needle))) {
    return 0;
  }
  if (title.includes(needle)) return 1;
  if (normalizeSearchText(hit.subtitle ?? "").includes(needle)) return 2;
  return 3;
}

export function filterAndGroupSearchHits(hits: SearchHit[], query: string): SearchHitGroup[] {
  const matched = hits.filter((hit) => hitMatches(hit, query));
  const grouped = new Map<SearchKind, SearchHit[]>();
  for (const kind of SEARCH_KINDS) grouped.set(kind, []);
  for (const hit of matched) {
    grouped.get(hit.kind)?.push(hit);
  }

  const trimmed = query.trim();
  return SEARCH_KINDS.flatMap((kind) => {
    const items = grouped.get(kind) ?? [];
    if (items.length === 0) return [];
    if (trimmed) {
      items.sort((a, b) => rankHit(a, trimmed) - rankHit(b, trimmed));
    }
    return [{ kind, hits: items }];
  });
}
