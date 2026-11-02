/*
 * F3/F5 query-string handling. Pure functions so they can be unit-tested.
 * Invalid values are ignored instead of crashing the page.
 */

export const PAGE_SIZE = 12;

export interface CatalogParams {
  page: number;
  q: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

function nonNegativeInt(v: string): number | undefined {
  if (!/^\d{1,12}$/.test(v)) return undefined;
  return Number(v);
}

export function parseCatalogParams(raw: RawParams): CatalogParams {
  const pageNum = nonNegativeInt(first(raw.page));
  const category = nonNegativeInt(first(raw.category));
  let minPrice = nonNegativeInt(first(raw.minPrice));
  let maxPrice = nonNegativeInt(first(raw.maxPrice));

  // If the user typed the range backwards, swap it rather than show nothing.
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    page: pageNum && pageNum >= 1 ? pageNum : 1,
    q: first(raw.q).slice(0, 100),
    category: category && category > 0 ? category : undefined,
    minPrice,
    maxPrice,
  };
}

/** Builds "q=...&category=..&page=.." keeping only meaningful values. */
export function toQueryString(params: Partial<CatalogParams>): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", String(params.category));
  if (params.minPrice !== undefined) sp.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) sp.set("maxPrice", String(params.maxPrice));
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  return sp.toString();
}

/**
 * Removes characters that have meaning inside a PostgREST `or=(...)` filter
 * or a LIKE pattern, so user input is always treated as plain text.
 */
export function sanitizeSearch(q: string): string {
  return q.replace(/[,()*%_\\:"]/g, " ").replace(/\s+/g, " ").trim();
}

export function totalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
